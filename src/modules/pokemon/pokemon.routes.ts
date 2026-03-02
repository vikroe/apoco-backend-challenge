import { FastifyPluginAsync } from 'fastify';
import { buildPaginatedResponseSchema } from '../common/common.schemas';
import type { PaginationQuery } from '../../utils/pagination';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import {
    getPokemonByIdController,
    getPokemonByNameController,
    listPokemonController,
    listPokemonTypesController,
} from './pokemon.controller';
import { getSchemaOrThrow, OpenApiSchema } from '../../utils/schema';
import { PokemonType } from '../../models/entities/pokemon.entity';

export interface PokemonByIdRouteParams {
    id: string;
}

export interface PokemonByNameRouteParams {
    name: string;
}

export interface ListPokemonRouteParams extends PaginationQuery {
    types?: PokemonType | PokemonType[];
    name?: string;
}

const listPokemonRouteSchema: OpenApiSchema = {
    tags: ['Pokemon'],
    summary: 'List pokemon',
    description: 'Return a paginated list of pokemon.',
    operationId: 'listPokemon',
    security: [{ bearerAuth: [] }],
};

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
    const listPokemonResponseSchema = buildPaginatedResponseSchema(
        SCHEMA_REGISTRY.pokemon.response
    );
    const authHeaderSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.authHeader
    );
    const listQuerystringSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.pokemon.listQuerystring
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

    server.get<{ Querystring: ListPokemonRouteParams }>(
        '/pokemon',
        {
            onRequest: server.authenticate,
            schema: {
                ...listPokemonRouteSchema,
                headers: authHeaderSchema,
                querystring: listQuerystringSchema,
                response: {
                    200: listPokemonResponseSchema,
                    400: errorResponseSchema,
                    401: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        listPokemonController
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
