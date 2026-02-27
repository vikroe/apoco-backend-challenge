import { FastifyPluginAsync, FastifySchema } from 'fastify';

export type OpenApiSchema = FastifySchema & {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    security?: Array<Record<string, string[]>>;
};

export const getSchemaOrThrow = (
    server: Parameters<FastifyPluginAsync>[0],
    schemaId: string
): unknown => {
    const schema = server.getSchema(schemaId);
    if (!schema) {
        throw new Error(`Schema with id "${schemaId}" is not registered.`);
    }

    return schema;
};
