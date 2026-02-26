import fastifyJwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { ACCESS_TOKEN_TTL_SECONDS, JWT_SECRET } from "./auth.config";

export const registerAuthTools = (server: FastifyInstance): void => {
    server.register(fastifyJwt, {
        secret: JWT_SECRET,
        sign: {
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        },
    });

    server.decorate("authenticate", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch {
            reply.code(401).send({ message: "Invalid or expired token" });
        }
    });
};
