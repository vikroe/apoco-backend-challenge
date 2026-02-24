import { FastifyPluginAsync } from "fastify";
import healthRoutes from "../modules/health/health.routes";

const routes: FastifyPluginAsync = async (server) => {
    await server.register(healthRoutes, { prefix: "/api/v1" });
};

export default routes;
