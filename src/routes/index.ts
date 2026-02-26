import { FastifyPluginAsync } from "fastify";
import authRoutes from "../modules/auth/auth.routes";
import healthRoutes from "../modules/health/health.routes";

const routes: FastifyPluginAsync = async (server) => {
    await server.register(healthRoutes, { prefix: "/api/v1" });
    await server.register(authRoutes, { prefix: "/api/v1" });
};

export default routes;
