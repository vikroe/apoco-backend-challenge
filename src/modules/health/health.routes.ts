import { FastifyPluginAsync } from "fastify";
import { pingController } from "./health.controller";

const healthRoutes: FastifyPluginAsync = async (server) => {
    server.get("/ping", pingController);
};

export default healthRoutes;
