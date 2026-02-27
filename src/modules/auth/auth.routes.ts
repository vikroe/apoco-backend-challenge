import { FastifyPluginAsync } from 'fastify';
import {
    CredentialsBody,
    loginController,
    meController,
    registerController,
} from './auth.controller';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { getSchemaOrThrow, OpenApiSchema } from '../../utils/schema';

const registerRouteSchema: OpenApiSchema = {
    tags: ['Auth'],
    summary: 'Register user',
    description: 'Create a new user account and return an access token.',
    operationId: 'registerUser',
};

const loginRouteSchema: OpenApiSchema = {
    tags: ['Auth'],
    summary: 'Login user',
    description: 'Authenticate a user and return an access token.',
    operationId: 'loginUser',
};

const meRouteSchema: OpenApiSchema = {
    tags: ['Auth'],
    summary: 'Get current user',
    description: 'Return the currently authenticated user.',
    operationId: 'getCurrentUser',
    security: [{ bearerAuth: [] }],
};

const authRoutes: FastifyPluginAsync = async server => {
    const credentialsBodySchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.auth.credentialsBody
    );
    const authResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.auth.authResponse
    );
    const meResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.auth.meResponse
    );
    const errorResponseSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.errorResponse
    );
    const authHeaderSchema = getSchemaOrThrow(
        server,
        SCHEMA_REGISTRY.common.authHeader
    );

    server.post<{ Body: CredentialsBody }>(
        '/auth/register',
        {
            schema: {
                ...registerRouteSchema,
                body: credentialsBodySchema,
                response: {
                    201: authResponseSchema,
                    400: errorResponseSchema,
                    409: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        registerController
    );

    server.post<{ Body: CredentialsBody }>(
        '/auth/login',
        {
            schema: {
                ...loginRouteSchema,
                body: credentialsBodySchema,
                response: {
                    200: authResponseSchema,
                    400: errorResponseSchema,
                    401: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        loginController
    );

    server.get(
        '/auth/me',
        {
            onRequest: server.authenticate,
            schema: {
                ...meRouteSchema,
                headers: authHeaderSchema,
                response: {
                    200: meResponseSchema,
                    401: errorResponseSchema,
                    500: errorResponseSchema,
                },
            },
        },
        meController
    );
};

export default authRoutes;
