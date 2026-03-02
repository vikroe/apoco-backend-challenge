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

    it('returns 409 when registering the same email twice', async () => {
        const payload = {
            email: 'duplicate-trainer@example.com',
            password: 'password123',
        };

        const firstResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload,
        });

        expect(firstResponse.statusCode).toBe(201);

        const secondResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload,
        });

        expect(secondResponse.statusCode).toBe(409);
        expect(secondResponse.json()).toEqual({
            message: `A user with email "${payload.email}" already exists.`,
        });
    });

    it('logs in an existing user and returns the authenticated user from /auth/me', async () => {
        const payload = {
            email: 'login-trainer@example.com',
            password: 'password123',
        };

        const registerResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload,
        });

        expect(registerResponse.statusCode).toBe(201);

        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload,
        });

        expect(loginResponse.statusCode).toBe(200);

        const loginBody = loginResponse.json<{
            accessToken: string;
            expiresIn: number;
            tokenType: string;
            user: {
                email: string;
                id: string;
            };
        }>();

        expect(loginBody.tokenType).toBe('Bearer');
        expect(loginBody.expiresIn).toBeGreaterThan(0);
        expect(loginBody.accessToken).toBeTruthy();
        expect(loginBody.user.email).toBe(payload.email);
        expect(loginBody.user.id).toBeTruthy();

        const meResponse = await app.inject({
            method: 'GET',
            url: '/api/v1/auth/me',
            headers: {
                authorization: `Bearer ${loginBody.accessToken}`,
            },
        });

        expect(meResponse.statusCode).toBe(200);
        expect(meResponse.json()).toEqual({
            user: {
                email: loginBody.user.email,
                id: loginBody.user.id,
            },
        });
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

    it('returns 401 when logging in with invalid credentials', async () => {
        const registerResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                email: 'invalid-login@example.com',
                password: 'password123',
            },
        });

        expect(registerResponse.statusCode).toBe(201);

        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: {
                email: 'invalid-login@example.com',
                password: 'wrong-password123',
            },
        });

        expect(loginResponse.statusCode).toBe(401);
        expect(loginResponse.json()).toEqual({
            message: 'Invalid email or password',
        });
    });

    it('returns 401 from /auth/me when no token is provided', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/auth/me',
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            message: 'Invalid or expired token',
        });
    });

    it('returns 401 from /auth/me when the token is invalid', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/auth/me',
            headers: {
                authorization: 'Bearer definitely-not-a-real-token',
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            message: 'Invalid or expired token',
        });
    });
});
