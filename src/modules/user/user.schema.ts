import { SCHEMA_REGISTRY } from '../schemaRegistry';

export const USER_SCHEMAS = [
    {
        $id: SCHEMA_REGISTRY.user.setFavoritePokemon,
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^\\d+$', minLength: 1 },
        },
    },
] as const;
