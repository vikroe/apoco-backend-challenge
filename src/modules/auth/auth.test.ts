import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    bootstrapTestApplication,
    teardownTestApplication,
} from '../../test/setup.js';

describe('auth integration', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        ({ app } = await bootstrapTestApplication());
    });

    afterAll(async () => {
        await teardownTestApplication(app);
    });

    it('registers a user and returns the authenticated user from /auth/me', async () => {
        const registerResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                email: 'trainer@example.com',
                password: 'password123',
            },
        });

        expect(registerResponse.statusCode).toBe(201);

        const registerBody = registerResponse.json<{
            accessToken: string;
            expiresIn: number;
            tokenType: string;
            user: {
                email: string;
                id: string;
            };
        }>();

        expect(registerBody.tokenType).toBe('Bearer');
        expect(registerBody.expiresIn).toBeGreaterThan(0);
        expect(registerBody.accessToken).toBeTruthy();
        expect(registerBody.user.email).toBe('trainer@example.com');
        expect(registerBody.user.id).toBeTruthy();

        const meResponse = await app.inject({
            method: 'GET',
            url: '/api/v1/auth/me',
            headers: {
                authorization: `Bearer ${registerBody.accessToken}`,
            },
        });

        expect(meResponse.statusCode).toBe(200);
        expect(meResponse.json()).toEqual({
            user: {
                email: registerBody.user.email,
                id: registerBody.user.id,
            },
        });
    });
});
