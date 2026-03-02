import { NotFoundError } from '@mikro-orm/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { serializePokemon } from './pokemon.serializer';
import {
    getPokemonById,
    getPokemonByName,
    listPokemon,
    listPokemonTypes,
} from './pokemon.service';
import {
    ListPokemonRouteParams,
    PokemonByIdRouteParams,
    PokemonByNameRouteParams,
} from './pokemon.routes';
import { PokemonType } from '../../models/entities/pokemon.entity';

const DEFAULT_POKEMON_PAGE = 1;
const DEFAULT_POKEMON_LIMIT = 20;

export const listPokemonController = async (
    request: FastifyRequest<{ Querystring: ListPokemonRouteParams }>,
    reply: FastifyReply
): Promise<void> => {
    const page = request.query.page ?? DEFAULT_POKEMON_PAGE;
    const limit = request.query.limit ?? DEFAULT_POKEMON_LIMIT;
    const rawTypes = request.query.types;
    const types: PokemonType[] = rawTypes
        ? Array.isArray(rawTypes)
            ? rawTypes
            : [rawTypes]
        : [];
    const name = request.query.name;
    const paginatedPokemon = await listPokemon({ page, limit, types, name });

    reply.code(200).send({
        ...paginatedPokemon,
        data: paginatedPokemon.data.map(serializePokemon),
    });
};

export const getPokemonByIdController = async (
    request: FastifyRequest<{ Params: PokemonByIdRouteParams }>,
    reply: FastifyReply
): Promise<void> => {
    try {
        const pokemon = await getPokemonById(request.params.id);
        reply.code(200).send(serializePokemon(pokemon));
    } catch (error) {
        if (error instanceof NotFoundError) {
            reply.code(404).send({ message: error.message });
            return;
        }

        throw error;
    }
};

export const getPokemonByNameController = async (
    request: FastifyRequest<{ Params: PokemonByNameRouteParams }>,
    reply: FastifyReply
): Promise<void> => {
    try {
        const pokemon = await getPokemonByName(request.params.name);
        reply.code(200).send(serializePokemon(pokemon));
    } catch (error) {
        if (error instanceof NotFoundError) {
            reply.code(404).send({ message: error.message });
            return;
        }

        throw error;
    }
};

export const listPokemonTypesController = (
    _request: FastifyRequest,
    reply: FastifyReply
): void => {
    reply.code(200).send(listPokemonTypes());
};
