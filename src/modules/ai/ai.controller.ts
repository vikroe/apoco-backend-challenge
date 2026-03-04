import { FastifyReply, FastifyRequest } from 'fastify';
import { askProfessor } from './ai.service';
import { AskProfessorRouteBody } from './ai.routes';
import {
    AI_SERVICE_UNAVAILABLE_MESSAGE,
    AiServiceUnavailableError,
} from '../../utils/errors';

export const askProfessorController = async (
    request: FastifyRequest<{ Body: AskProfessorRouteBody }>,
    reply: FastifyReply
): Promise<void> => {
    try {
        const answer = await askProfessor(request.body.question);
        reply.code(200).send(answer);
    } catch (error) {
        if (error instanceof AiServiceUnavailableError) {
            reply.code(503).send({ message: AI_SERVICE_UNAVAILABLE_MESSAGE });
            return;
        }

        throw error;
    }
};
