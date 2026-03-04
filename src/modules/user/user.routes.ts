import { FastifyPluginAsync } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { OpenApiSchema, schemaRef } from '../../utils/schema';
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
    server.post<{ Params: SetPokemonRouteParams }>(
        '/user/set-favorite-pokemon/:id',
        {
            onRequest: server.authenticate,
            schema: {
                ...setFavoritePokemonRouteSchema,
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                params: schemaRef(SCHEMA_REGISTRY.user.setFavoritePokemon),
                response: {
                    200: {},
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    404: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                params: schemaRef(SCHEMA_REGISTRY.user.setFavoritePokemon),
                response: {
                    200: {},
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    404: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                },
            },
        },
        unsetFavoritePokemonController
    );
};

export default userRoutes;
