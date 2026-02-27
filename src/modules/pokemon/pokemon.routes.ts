import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { getPokemonController } from './pokemon.controller';
import { getSchemaOrThrow, OpenApiSchema } from '../../utils/schema';

interface PokemonByIdRouteParams {
    id: string;
}

const getPokemonRouteSchema: OpenApiSchema = {
    tags: ['Pokemon'],
    summary: 'Get pokemon by id',
    description: 'Return a pokemon in the original seed JSON shape.',
    operationId: 'getPokemonById',
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
                ...getPokemonRouteSchema,
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
        getPokemonController
    );
};

export default pokemonRoutes;
