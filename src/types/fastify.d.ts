import '@fastify/jwt';
import 'fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            id: number;
            email: string;
        };
        user: {
            id: number;
            email: string;
        };
    }
}

export {};
