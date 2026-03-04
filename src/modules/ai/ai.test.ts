import type { FastifyInstance } from 'fastify';
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import {
    bootstrapTestApplication,
    teardownTestApplication,
} from '../../test/setup.js';

describe('ai integration', () => {
    let app: FastifyInstance;
    let accessToken: string;

    const configureOpenAi = () => {
        process.env.OPENAI_API_KEY = 'test-openai-key';
        process.env.OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
        process.env.OPENAI_MODEL = 'gpt-4o-mini';
        process.env.OPENAI_MAX_OUTPUT_TOKENS = '300';
        process.env.OPENAI_TIMEOUT_MS = '20000';
    };

    beforeAll(async () => {
        ({ app } = await bootstrapTestApplication());

        const registerResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                email: 'professor-oak@example.com',
                password: 'password123',
            },
        });

        if (registerResponse.statusCode !== 201) {
            throw new Error(
                `Failed to create auth token for ai tests: ${registerResponse.body}`
            );
        }

        accessToken = registerResponse.json<{ accessToken: string }>()
            .accessToken;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_BASE_URL;
        delete process.env.OPENAI_MODEL;
        delete process.env.OPENAI_MAX_OUTPUT_TOKENS;
        delete process.env.OPENAI_TIMEOUT_MS;
    });

    afterAll(async () => {
        await teardownTestApplication(app);
    });

    const askProfessor = (question: string) => {
        return app.inject({
            method: 'POST',
            url: '/api/v1/ai/ask-professor',
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
            payload: { question },
        });
    };

    it('answers a Pokemon question through the OpenAI Responses API', async () => {
        configureOpenAi();

        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({
                    output_text:
                        'Bulbasaur evolves into Ivysaur and then Venusaur.',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        );

        const response = await askProfessor('What does Bulbasaur evolve into?');

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            answer: 'Bulbasaur evolves into Ivysaur and then Venusaur.',
        });
        expect(fetchSpy).toHaveBeenCalledTimes(1);

        const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://api.openai.com/v1/responses');
        expect(init.headers).toMatchObject({
            Authorization: 'Bearer test-openai-key',
            'Content-Type': 'application/json',
        });

        const body = JSON.parse(String(init.body)) as {
            model: string;
            input: Array<{
                content: Array<{
                    text: string;
                }>;
            }>;
            max_output_tokens: number;
        };

        expect(body.model).toBe('gpt-4o-mini');
        expect(body.max_output_tokens).toBe(300);
        expect(body.input[1]?.content[0]?.text).toContain(
            'Question: What does Bulbasaur evolve into?'
        );
        expect(body.input[1]?.content[0]?.text).toContain('"name":"Bulbasaur"');
    });

    it('returns 503 when the OpenAI API key is not configured', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');

        const response = await askProfessor('What type is Pikachu?');

        expect(response.statusCode).toBe(503);
        expect(response.json()).toEqual({
            message: 'AI service is temporarily unavailable',
        });
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns 503 when the OpenAI request fails', async () => {
        configureOpenAi();

        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({ error: { message: 'unauthorized' } }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        );

        const response = await askProfessor(
            'What is the strongest fire Pokemon?'
        );

        expect(response.statusCode).toBe(503);
        expect(response.json()).toEqual({
            message: 'AI service is temporarily unavailable',
        });
    });
});
