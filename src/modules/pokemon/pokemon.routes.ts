import { FastifyPluginAsync } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import {
    getPokemonByIdController,
    getPokemonByNameController,
    listPokemonTypesController,
} from './pokemon.controller';
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

const listPokemonTypesRouteSchema: OpenApiSchema = {
    tags: ['Pokemon'],
    summary: 'List pokemon types',
    description: 'Return the available pokemon types.',
    operationId: 'listPokemonTypes',
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
    const pokemonTypesResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.pokemon.typesResponse
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

    server.get<{ Params: PokemonByNameRouteParams }>(
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
                },
            },
        },
        getPokemonByNameController
    );

    server.get(
        '/pokemon/types',
        {
            onRequest: server.authenticate,
            schema: {
                ...listPokemonTypesRouteSchema,
                headers: authHeaderSchema,
                response: {
                    200: pokemonTypesResponseSchema,
                    401: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        listPokemonTypesController
    );
};

export default pokemonRoutes;
