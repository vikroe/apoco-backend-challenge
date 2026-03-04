import { SCHEMA_REGISTRY } from '../schemaRegistry';

export const AI_SCHEMAS = [
    {
        $id: SCHEMA_REGISTRY.ai.askProfessorBody,
        type: 'object',
        additionalProperties: false,
        required: ['question'],
        properties: {
            question: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                pattern: '^.*\\S.*$',
            },
        },
    },
    {
        $id: SCHEMA_REGISTRY.ai.askProfessorResponse,
        type: 'object',
        additionalProperties: false,
        required: ['answer'],
        properties: {
            answer: { type: 'string', minLength: 1 },
        },
    },
] as const;
