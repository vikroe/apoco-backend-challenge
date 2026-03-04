import { FastifySchema } from 'fastify';

export type OpenApiSchema = FastifySchema & {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    security?: Array<Record<string, string[]>>;
};

export const schemaRef = (schemaId: string): { $ref: string } => ({
    $ref: `${schemaId}#`,
});
