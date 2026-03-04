import { QueryOrder } from '@mikro-orm/core';
import { getOrm } from '../../models/dataSource';
import { Pokemon } from '../../models/entities/pokemon.entity';
import {
    PokemonResponse,
    serializePokemon,
} from '../pokemon/pokemon.serializer';
import {
    POKEMON_RELATIONS,
    type PokemonWithRelations,
} from '../pokemon/pokemon.service';
import { AiServiceUnavailableError } from '../../utils/errors';
import {
    getEnvValue,
    getOptionalEnvValue,
    getPositiveIntegerEnvValue,
} from '../../utils/env';
import { normalizeBaseUrl } from '../../utils/url';

const PROFESSOR_SYSTEM_PROMPT = [
    'You are Professor Oak.',
    'Answer questions only with facts from the provided Pokemon catalog data.',
    'If the catalog does not contain enough information to answer the question, say so clearly.',
    'Keep answers concise, factual, and written in plain text.',
].join(' ');

interface AskProfessorResponse {
    answer: string;
}

interface OpenAiConfig {
    apiKey: string;
    apiBaseUrl: string;
    model: string;
    maxOutputTokens: number;
    timeoutMs: number;
}

interface OpenAiInputMessage {
    role: 'system' | 'user';
    content: Array<{
        type: 'input_text';
        text: string;
    }>;
}

interface OpenAiResponseBody {
    output_text?: string;
    output?: Array<{
        content?: Array<{
            text?: string;
        }>;
    }>;
}

const getOpenAiConfig = (): OpenAiConfig | null => {
    const apiKey = getOptionalEnvValue('OPENAI_API_KEY');
    if (!apiKey) {
        return null;
    }

    try {
        return {
            apiKey,
            apiBaseUrl: normalizeBaseUrl(getEnvValue('OPENAI_API_BASE_URL')),
            model: getEnvValue('OPENAI_MODEL'),
            maxOutputTokens: getPositiveIntegerEnvValue(
                'OPENAI_MAX_OUTPUT_TOKENS'
            ),
            timeoutMs: getPositiveIntegerEnvValue('OPENAI_TIMEOUT_MS'),
        };
    } catch {
        throw new AiServiceUnavailableError();
    }
};

const loadPokemonCatalog = async (): Promise<PokemonResponse[]> => {
    const em = getOrm().em.fork();
    const pokemons = await em.find(
        Pokemon,
        {},
        {
            populate: POKEMON_RELATIONS,
            orderBy: { id: QueryOrder.ASC },
        }
    );

    return pokemons.map(pokemon =>
        serializePokemon(pokemon as PokemonWithRelations)
    );
};

const buildOpenAiInput = (
    question: string,
    catalog: PokemonResponse[]
): OpenAiInputMessage[] => {
    const catalogContext = JSON.stringify({ pokemons: catalog });

    return [
        {
            role: 'system',
            content: [
                {
                    type: 'input_text',
                    text: PROFESSOR_SYSTEM_PROMPT,
                },
            ],
        },
        {
            role: 'user',
            content: [
                {
                    type: 'input_text',
                    text: `Pokemon catalog JSON: ${catalogContext}\n\nQuestion: ${question}`,
                },
            ],
        },
    ];
};

const extractAnswer = (responseBody: OpenAiResponseBody): string => {
    if (responseBody.output_text?.trim()) {
        return responseBody.output_text.trim();
    }

    const answer = responseBody.output
        ?.flatMap(output => output.content ?? [])
        .map(content => content.text?.trim())
        .filter((content): content is string => Boolean(content))
        .join('\n')
        .trim();

    if (!answer) {
        throw new AiServiceUnavailableError(
            'OpenAI did not return a usable answer'
        );
    }

    return answer;
};

const createProfessorAnswer = async (
    config: OpenAiConfig,
    question: string,
    catalog: PokemonResponse[]
): Promise<string> => {
    let response: Response;

    try {
        response = await fetch(`${config.apiBaseUrl}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                input: buildOpenAiInput(question, catalog),
                max_output_tokens: config.maxOutputTokens,
            }),
            signal: AbortSignal.timeout(config.timeoutMs),
        });
    } catch {
        throw new AiServiceUnavailableError();
    }

    if (!response.ok) {
        throw new AiServiceUnavailableError();
    }

    try {
        const responseBody = (await response.json()) as OpenAiResponseBody;
        return extractAnswer(responseBody);
    } catch {
        throw new AiServiceUnavailableError();
    }
};

export const askProfessor = async (
    question: string
): Promise<AskProfessorResponse> => {
    const config = getOpenAiConfig();
    if (!config) {
        throw new AiServiceUnavailableError();
    }

    const normalizedQuestion = question.trim();
    const catalog = await loadPokemonCatalog();
    const answer = await createProfessorAnswer(
        config,
        normalizedQuestion,
        catalog
    );

    return { answer };
};
