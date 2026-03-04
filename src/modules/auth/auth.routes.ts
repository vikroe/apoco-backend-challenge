import { FastifyPluginAsync } from 'fastify';
import {
    CredentialsBody,
    loginController,
    meController,
    registerController,
} from './auth.controller';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { OpenApiSchema, schemaRef } from '../../utils/schema';

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
    server.post<{ Body: CredentialsBody }>(
        '/auth/register',
        {
            schema: {
                ...registerRouteSchema,
                body: schemaRef(SCHEMA_REGISTRY.auth.credentialsBody),
                response: {
                    201: schemaRef(SCHEMA_REGISTRY.auth.authResponse),
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    409: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                body: schemaRef(SCHEMA_REGISTRY.auth.credentialsBody),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.auth.authResponse),
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
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
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.auth.meResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    500: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                },
            },
        },
        meController
    );
};

export default authRoutes;
