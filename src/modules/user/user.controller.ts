import { NotFoundError } from '@mikro-orm/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SetPokemonRouteParams } from './user.routes';
import { setFavoritePokemon } from './user.service';

export const setFavoritePokemonController = async (
    request: FastifyRequest<{ Params: SetPokemonRouteParams }>,
    reply: FastifyReply
): Promise<void> => {
    try {
        await setFavoritePokemon({
            userId: request.user.id,
            id: request.params.id,
        });

        reply.code(200).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            reply.code(404).send({ message: error.message });
            return;
        }

        throw error;
    }
};

export const unsetFavoritePokemonController = async (
    request: FastifyRequest<{ Params: SetPokemonRouteParams }>,
    reply: FastifyReply
): Promise<void> => {
    try {
        await setFavoritePokemon({
            userId: request.user.id,
            id: request.params.id,
            unset: true,
        });

        reply.code(200).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            reply.code(404).send({ message: error.message });
            return;
        }

        throw error;
    }
};
