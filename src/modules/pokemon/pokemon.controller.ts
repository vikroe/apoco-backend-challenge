import { NotFoundError } from '@mikro-orm/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { serializePokemon } from './pokemon.serializer';
import {
    getPokemonById,
    getPokemonByName,
    listPokemonTypes,
} from './pokemon.service';
import {
    PokemonByIdRouteParams,
    PokemonByNameRouteParams,
} from './pokemon.routes';

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
