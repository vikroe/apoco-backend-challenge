import { NotFoundError } from '@mikro-orm/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { serializePokemon } from './pokemon.serializer';
import { getPokemonById } from './pokemon.service';

interface PokemonByIdParams {
    id: string;
}

export const getPokemonController = async (
    request: FastifyRequest<{ Params: PokemonByIdParams }>,
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
