import { FastifyPluginAsync } from 'fastify';
import { SCHEMA_REGISTRY } from '../schemaRegistry';
import { OpenApiSchema, schemaRef } from '../../utils/schema';
import { askProfessorController } from './ai.controller';

export interface AskProfessorRouteBody {
    question: string;
}

const askProfessorRouteSchema: OpenApiSchema = {
    tags: ['AI'],
    summary: 'Ask the Professor',
    description:
        'Answer Pokemon questions with an LLM grounded in the seeded catalog data.',
    operationId: 'askProfessor',
    security: [{ bearerAuth: [] }],
};

const aiRoutes: FastifyPluginAsync = async server => {
    server.post<{ Body: AskProfessorRouteBody }>(
        '/ai/ask-professor',
        {
            onRequest: server.authenticate,
            schema: {
                ...askProfessorRouteSchema,
                headers: schemaRef(SCHEMA_REGISTRY.common.authHeader),
                body: schemaRef(SCHEMA_REGISTRY.ai.askProfessorBody),
                response: {
                    200: schemaRef(SCHEMA_REGISTRY.ai.askProfessorResponse),
                    400: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    401: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                    503: schemaRef(SCHEMA_REGISTRY.common.errorResponse),
                },
            },
        },
        askProfessorController
    );
};

export default aiRoutes;
