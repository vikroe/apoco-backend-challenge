import { FastifyPluginAsync } from 'fastify';
import authRoutes from './auth/auth.routes';
import healthRoutes from './health/health.routes';

const routesRegistry: FastifyPluginAsync = async server => {
    await server.register(healthRoutes, { prefix: '/api/v1' });
    await server.register(authRoutes, { prefix: '/api/v1' });
};

export default routesRegistry;
