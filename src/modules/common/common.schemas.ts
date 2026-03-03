import { SCHEMA_REGISTRY } from '../schemaRegistry';

const PAGINATION_METADATA_PROPERTIES = {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1 },
    total: { type: 'integer', minimum: 0 },
    totalPages: { type: 'integer', minimum: 0 },
} as const;

export const buildPaginatedResponseSchema = (itemSchemaId: string) => ({
    type: 'object',
    additionalProperties: false,
    required: ['data', 'page', 'limit', 'total', 'totalPages'],
    properties: {
        data: {
            type: 'array',
            items: { $ref: `${itemSchemaId}#` },
        },
        ...PAGINATION_METADATA_PROPERTIES,
    },
});

export const COMMON_SCHEMA_DEFINITION = [
    {
        $id: SCHEMA_REGISTRY.common.errorResponse,
        type: 'object',
        additionalProperties: true,
        required: ['message'],
        properties: {
            message: { type: 'string' },
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
