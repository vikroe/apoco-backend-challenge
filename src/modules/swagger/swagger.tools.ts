import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export function registerSwaggerTools(server: FastifyInstance): void {
    const apiHost = process.env.API_HOST ?? 'localhost';
    const apiPort = Number(process.env.API_PORT ?? 8080);

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
                    url: `http://${apiHost}:${apiPort}`,
                    description: 'Local development',
                },
            ],
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Health', description: 'Health check endpoints' },
                { name: 'Pokemon', description: 'Pokemon endpoints' },
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
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });
}
