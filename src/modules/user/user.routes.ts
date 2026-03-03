import { FastifyPluginAsync } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { getSchemaOrThrow, OpenApiSchema } from '../../utils/schema';
import {
    setFavoritePokemonController,
    unsetFavoritePokemonController,
} from './user.controller';

export interface SetPokemonRouteParams {
    id: string;
}

const setFavoritePokemonRouteSchema: OpenApiSchema = {
    tags: ['User'],
    summary: 'Set favorite pokemon',
    description: 'Sets a pokemon as favorite.',
    operationId: 'setFavoritePokemon',
    security: [{ bearerAuth: [] }],
};

const unsetFavoritePokemonRouteSchema: OpenApiSchema = {
    tags: ['User'],
    summary: 'Unset favorite pokemon',
    description: 'Unsets a pokemon as favorite.',
    operationId: 'unsetFavoritePokemon',
    security: [{ bearerAuth: [] }],
};

const userRoutes: FastifyPluginAsync = async server => {
    const authHeaderSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.authHeader
    );
    const errorResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.errorResponse
    );
    const setFavoritePokemonSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.user.setFavoritePokemon
    );

    server.post<{ Params: SetPokemonRouteParams }>(
        '/user/set-favorite-pokemon/:id',
        {
            onRequest: server.authenticate,
            schema: {
                ...setFavoritePokemonRouteSchema,
                headers: authHeaderSchema,
                params: setFavoritePokemonSchema,
                response: {
                    200: {},
                    401: errorResponseSchema,
                    404: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        setFavoritePokemonController
    );

    server.post<{ Params: SetPokemonRouteParams }>(
        '/user/unset-favorite-pokemon/:id',
        {
            onRequest: server.authenticate,
            schema: {
                ...unsetFavoritePokemonRouteSchema,
                headers: authHeaderSchema,
                params: setFavoritePokemonSchema,
                response: {
                    200: {},
                    401: errorResponseSchema,
                    404: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        unsetFavoritePokemonController
    );
};

export default userRoutes;
