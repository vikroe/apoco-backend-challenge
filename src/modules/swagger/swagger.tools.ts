import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export const SWAGGER_UI_PATH = '/documentation';
export const SWAGGER_SPEC_PATH = '/documentation/json';

export function registerSwaggerTools(server: FastifyInstance): void {
    server.register(swagger, {
        mode: 'dynamic',
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Apoco Backend Challenge API',
                description:
                    'API documentation for the Apoco backend challenge.',
                version: '1.0.0',
            },
            servers: [
                {
                    url: '/',
                    description: 'Current origin',
                },
            ],
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Pokemon', description: 'Pokemon endpoints' },
                { name: 'User', description: 'User endpoints' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });

    server.register(swaggerUI, {
        routePrefix: SWAGGER_UI_PATH,
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });
}
