import fastify, { FastifyInstance } from 'fastify';
import { closeOrm } from './models/dataSource';
import { registerAuthTools } from './modules/auth/auth.tools';
import schemasPlugin from './plugins/schemas.plugin';
import routesRegistry from './modules/routesRegistry';
import { registerSwaggerTools } from './modules/swagger/swagger.tools';

export const buildApplication = (): FastifyInstance => {
    const server = fastify();

    registerAuthTools(server);
    server.register(schemasPlugin);
    registerSwaggerTools(server);
    server.register(routesRegistry);
    server.addHook('onClose', closeOrm);

    return server;
};

export default buildApplication;
