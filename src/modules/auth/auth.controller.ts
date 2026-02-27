import { FastifyReply, FastifyRequest } from 'fastify';
import { authenticateUser, getUserById, registerUser } from './auth.service';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.config';
import { UserAlreadyExistsError } from '../../utils/errors';

export interface CredentialsBody {
    email: string;
    password: string;
}

type CredentialsRequest = FastifyRequest<{ Body: CredentialsBody }>;

const toAuthResponse = (token: string, user: { id: string; email: string }) => {
    return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        user,
    };
};

export const registerController = async (
    request: CredentialsRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await registerUser(
        request.body.email,
        request.body.password
    ).catch((error: unknown) => {
        if (error instanceof UserAlreadyExistsError) {
            reply.code(409).send({ message: error.message });
            return null;
        }

        throw error;
    });

    if (!user) {
        return;
    }

    const accessToken = await reply.jwtSign({ id: user.id, email: user.email });

    reply.code(201).send(
        toAuthResponse(accessToken, {
            id: user.id,
            email: user.email,
        })
    );
};

export const loginController = async (
    request: CredentialsRequest,
    reply: FastifyReply
): Promise<void> => {
    const user = await authenticateUser(
        request.body.email,
        request.body.password
    );
    if (!user) {
        reply.code(401).send({ message: 'Invalid email or password' });
        return;
    }

    const accessToken = await reply.jwtSign({ id: user.id, email: user.email });

    reply.code(200).send(
        toAuthResponse(accessToken, {
            id: user.id,
            email: user.email,
        })
    );
};

export const meController = async (
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> => {
    if (!request.user) {
        reply.code(401).send({ message: 'Unauthenticated' });
        return;
    }

    const user = await getUserById(request.user.id);
    if (!user) {
        reply.code(401).send({ message: 'Unauthenticated' });
        return;
    }

    reply.code(200).send({
        user: {
            id: user.id,
            email: user.email,
        },
    });
};
