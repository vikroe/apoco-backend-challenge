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
import { OpenApiSchema, schemaRef } from '../../utils/schema';
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
    favorites?: boolean;
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

    server.get<{ Querystring: ListPokemonRouteParams }>(
        '/pokemon',
        {
            onRequest: server.authenticate,
            schema: {
                ...listPokemonRouteSchema,
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                querystring: schemaRef(SCHEMA_REGISTRY.pokemon.listQuerystring),
                response: {
                    200: listPokemonResponseSchema,
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                params: schemaRef(SCHEMA_REGISTRY.pokemon.getByIdParams),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.pokemon.response),
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    404: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                params: schemaRef(SCHEMA_REGISTRY.pokemon.getByNameParams),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.pokemon.response),
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    404: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.pokemon.typesResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                },
            },
        },
        listPokemonTypesController
    );
};

export default pokemonRoutes;
