import { FastifyPluginAsync } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { getPokemonByIdController, getPokemonByNameController } from './pokemon.controller';
import { getSchemaOrThrow, OpenApiSchema } from '../../utils/schema';

export interface PokemonByIdRouteParams {
    id: string;
}

export interface PokemonByNameRouteParams {
    name: string;
}

const getPokemonByIdRouteSchema: OpenApiSchema = {
    tags: ['Pokemon'],
    summary: 'Get pokemon by id',
    description: 'Return pokemon description by its id.',
    operationId: 'getPokemonById',
    security: [{ bearerAuth: [] }],
};

const getPokemonByNameRouteSchema: OpenApiSchema = {
    tags: ['Pokemon'],
    summary: 'Get pokemon by name',
    description: 'Return pokemon description by its name.',
    operationId: 'getPokemonByName',
    security: [{ bearerAuth: [] }],
};

const pokemonRoutes: FastifyPluginAsync = async server => {
    const authHeaderSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.authHeader
    );
    const getByIdParamsSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.pokemon.getByIdParams
    );
    const getByNameParamsSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.pokemon.getByNameParams
    );
    const pokemonResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.pokemon.response
    );
    const errorResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.errorResponse
    );

    server.get<{ Params: PokemonByIdRouteParams }>(
        '/pokemon/:id',
        {
            onRequest: server.authenticate,
            schema: {
                ...getPokemonByIdRouteSchema,
                headers: authHeaderSchema,
                params: getByIdParamsSchema,
                response: {
                    200: pokemonResponseSchema,
                    400: errorResponseSchema,
                    401: errorResponseSchema,
                    404: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        getPokemonByIdController
    );

    server.get<{ Params: PokemonByNameRouteParams}>(
        '/pokemon/name/:name',
        {
            onRequest: server.authenticate,
            schema: {
                ...getPokemonByNameRouteSchema,
                headers: authHeaderSchema,
                params: getByNameParamsSchema,
                response: {
                    200: pokemonResponseSchema,
                    400: errorResponseSchema,
                    401: errorResponseSchema,
                    404: errorResponseSchema,
                    500: errorResponseSchema,
                }
            }
        },
        getPokemonByNameController
    )
};

export default pokemonRoutes;
