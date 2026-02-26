import { SCHEMA_REGISTRY } from '../schemaRegistry';

export const AUTH_SCHEMAS = [
    {
        $id: SCHEMA_REGISTRY.auth.credentialsBody,
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', maxLength: 64 },
            password: { type: 'string', minLength: 8, maxLength: 128 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.auth.user,
        type: 'object',
        additionalProperties: false,
        required: ['id', 'email'],
        properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email', maxLength: 64 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.auth.authResponse,
        type: 'object',
        additionalProperties: false,
        required: ['accessToken', 'tokenType', 'expiresIn', 'user'],
        properties: {
            accessToken: { type: 'string', minLength: 1 },
            tokenType: { type: 'string', enum: ['Bearer'] },
            expiresIn: { type: 'integer', minimum: 1 },
            user: { $ref: `${SCHEMA_REGISTRY.auth.user}#` },
        },
    },
    {
        $id: SCHEMA_REGISTRY.auth.meResponse,
        type: 'object',
        additionalProperties: false,
        required: ['user'],
        properties: {
            user: { $ref: `${SCHEMA_REGISTRY.auth.user}#` },
        },
    },
    {
        $id: SCHEMA_REGISTRY.common.authHeader,
        type: 'object',
        additionalProperties: true,
        required: ['authorization'],
        properties: {
            authorization: {
                type: 'string',
                description: 'Bearer <access-token>',
            },
        },
    },
];
