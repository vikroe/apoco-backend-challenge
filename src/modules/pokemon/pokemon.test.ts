import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    bootstrapTestApplication,
    teardownTestApplication,
} from '../../test/setup.js';

describe('pokemon integration', () => {
    let app: FastifyInstance;
    let accessToken: string;

    beforeAll(async () => {
        ({ app } = await bootstrapTestApplication());

        const registerResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                email: 'pokemon-trainer@example.com',
                password: 'password123',
            },
        });

        if (registerResponse.statusCode !== 201) {
            throw new Error(
                `Failed to create auth token for pokemon tests: ${registerResponse.body}`
            );
        }

        accessToken = registerResponse.json<{ accessToken: string }>()
            .accessToken;
    });

    afterAll(async () => {
        await teardownTestApplication(app);
    });

    const getPokemon = (id: string) => {
        return app.inject({
            method: 'GET',
            url: `/api/v1/pokemon/${id}`,
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
    };

    it('returns the expected Bulbasaur payload from the seeded dataset', async () => {
        const response = await getPokemon('001');

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            id: '001',
            name: 'Bulbasaur',
            classification: 'Seed Pokémon',
            types: ['Grass', 'Poison'],
            resistant: [
                'Water',
                'Electric',
                'Grass',
                'Fighting',
                'Fairy',
            ],
            weaknesses: ['Fire', 'Ice', 'Flying', 'Psychic'],
            weight: {
                minimum: '6.04kg',
                maximum: '7.76kg',
            },
            height: {
                minimum: '0.61m',
                maximum: '0.79m',
            },
            fleeRate: 0.1,
            evolutionRequirements: {
                amount: 25,
                name: 'Bulbasaur candies',
            },
            evolutions: [
                {
                    id: 2,
                    name: 'Ivysaur',
                },
                {
                    id: 3,
                    name: 'Venusaur',
                },
            ],
            maxCP: 951,
            maxHP: 1071,
            attacks: {
                fast: [
                    {
                        name: 'Tackle',
                        type: 'Normal',
                        damage: 12,
                    },
                    {
                        name: 'Vine Whip',
                        type: 'Grass',
                        damage: 7,
                    },
                ],
                special: [
                    {
                        name: 'Power Whip',
                        type: 'Grass',
                        damage: 70,
                    },
                    {
                        name: 'Seed Bomb',
                        type: 'Grass',
                        damage: 40,
                    },
                    {
                        name: 'Sludge Bomb',
                        type: 'Poison',
                        damage: 55,
                    },
                ],
            },
        });
    });

    it('normalizes leading zeroes when parsing pokemon ids', async () => {
        const canonicalResponse = await getPokemon('001');
        const unpaddedResponse = await getPokemon('1');
        const extraPaddedResponse = await getPokemon('0001');

        expect(canonicalResponse.statusCode).toBe(200);
        expect(unpaddedResponse.statusCode).toBe(200);
        expect(extraPaddedResponse.statusCode).toBe(200);

        expect(unpaddedResponse.json()).toEqual(canonicalResponse.json());
        expect(extraPaddedResponse.json()).toEqual(canonicalResponse.json());
    });

    it('returns 404 when the pokemon id does not exist', async () => {
        const response = await getPokemon('9999');

        expect(response.statusCode).toBe(404);
        expect(response.json<{ message: string }>()).toEqual({
            message: 'Could not find a pokemon for this ID',
        });
    });
});
