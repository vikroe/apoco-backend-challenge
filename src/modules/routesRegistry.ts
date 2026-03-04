import { FastifyPluginAsync } from 'fastify';
import authRoutes from './auth/auth.routes';
import pokemonRoutes from './pokemon/pokemon.routes';
import userRoutes from './user/user.routes';

const routesRegistry: FastifyPluginAsync = async server => {
    await server.register(authRoutes, { prefix: '/api/v1' });
    await server.register(pokemonRoutes, { prefix: '/api/v1' });
    await server.register(userRoutes, { prefix: '/api/v1' });
};

export default routesRegistry;
