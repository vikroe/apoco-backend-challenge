import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PokemonType } from '../../models/entities/pokemon.entity';
import type { PaginatedResponse } from '../../utils/pagination';
import {
    bootstrapTestApplication,
    teardownTestApplication,
} from '../../test/setup.js';
import type { PokemonResponse } from './pokemon.serializer';

type ListPokemonQuery = Record<string, string | string[]>;

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

    const listPokemon = (query?: ListPokemonQuery) => {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(query ?? {})) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    searchParams.append(key, item);
                }
                continue;
            }

            searchParams.append(key, value);
        }

        const queryString = searchParams.toString();

        return app.inject({
            method: 'GET',
            url: queryString
                ? `/api/v1/pokemon?${queryString}`
                : '/api/v1/pokemon',
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
    };

    const getPokemonByName = (name: string) => {
        return app.inject({
            method: 'GET',
            url: `/api/v1/pokemon/name/${encodeURIComponent(name)}`,
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
    };

    const getPokemonTypes = () => {
        return app.inject({
            method: 'GET',
            url: '/api/v1/pokemon/types',
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
    };

    it('returns a paginated list of pokemon ordered by numeric id', async () => {
        const response = await listPokemon();
        const firstPokemonResponse = await getPokemon('001');

        expect(response.statusCode).toBe(200);
        expect(firstPokemonResponse.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 1,
            limit: 20,
            total: 151,
            totalPages: 8,
        });
        expect(
            response.json<PaginatedResponse<PokemonResponse>>().data
        ).toHaveLength(20);
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.slice(0, 3)
                .map(pokemon => pokemon.id)
        ).toEqual(['001', '002', '003']);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>().data[0]
        ).toEqual(firstPokemonResponse.json<PokemonResponse>());
    });

    it('supports page and limit query parameters for pokemon pagination', async () => {
        const response = await listPokemon({
            page: '2',
            limit: '3',
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 2,
            limit: 3,
            total: 151,
            totalPages: 51,
        });
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.map(pokemon => pokemon.id)
        ).toEqual(['004', '005', '006']);
    });

    it('returns an empty page when pokemon pagination exceeds the dataset', async () => {
        const response = await listPokemon({
            page: '99',
            limit: '20',
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 99,
            limit: 20,
            total: 151,
            totalPages: 8,
            data: [],
        });
    });

    it('filters pokemon by a single type', async () => {
        const response = await listPokemon({
            types: ['BUG'],
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 1,
            limit: 20,
            total: 12,
            totalPages: 1,
        });
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.map(pokemon => pokemon.name)
        ).toEqual([
            'Caterpie',
            'Metapod',
            'Butterfree',
            'Weedle',
            'Kakuna',
            'Beedrill',
            'Paras',
            'Parasect',
            'Venonat',
            'Venomoth',
            'Scyther',
            'Pinsir',
        ]);
    });

    it('filters pokemon by multiple types using array containment semantics', async () => {
        const response = await listPokemon({
            types: ['GRASS', 'POISON'],
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 1,
            limit: 20,
            total: 9,
            totalPages: 1,
        });
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.map(pokemon => pokemon.name)
        ).toEqual([
            'Bulbasaur',
            'Ivysaur',
            'Venusaur',
            'Oddish',
            'Gloom',
            'Vileplume',
            'Bellsprout',
            'Weepinbell',
            'Victreebel',
        ]);
    });

    it('filters pokemon by partial name case-insensitively', async () => {
        const response = await listPokemon({
            name: 'saur',
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
        });
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.map(pokemon => pokemon.name)
        ).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur']);
    });

    it('combines name and type filters', async () => {
        const response = await listPokemon({
            name: 'saur',
            types: ['GRASS', 'POISON'],
        });

        expect(response.statusCode).toBe(200);
        expect(
            response.json<PaginatedResponse<PokemonResponse>>()
        ).toMatchObject({
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
        });
        expect(
            response
                .json<PaginatedResponse<PokemonResponse>>()
                .data.map(pokemon => pokemon.name)
        ).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur']);
    });

    it('returns the expected Bulbasaur payload from the seeded dataset', async () => {
        const response = await getPokemon('001');

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            id: '001',
            name: 'Bulbasaur',
            classification: 'Seed Pokémon',
            types: ['Grass', 'Poison'],
            resistant: ['Water', 'Electric', 'Grass', 'Fighting', 'Fairy'],
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

    it('returns the expected pokemon payload when looking up by name', async () => {
        const byIdResponse = await getPokemon('001');
        const byNameResponse = await getPokemonByName('Bulbasaur');
        const byLowercaseNameResponse = await getPokemonByName('bulbasaur');

        expect(byNameResponse.statusCode).toBe(200);
        expect(byNameResponse.json()).toEqual(byIdResponse.json());
        expect(byNameResponse.json()).toEqual(byLowercaseNameResponse.json());
    });

    it('supports pokemon names with spaces and punctuation', async () => {
        const response = await getPokemonByName('Mr. Mime');

        expect(response.statusCode).toBe(200);
        expect(response.json<{ name: string }>()).toMatchObject({
            name: 'Mr. Mime',
        });
    });

    it('returns 404 when the pokemon name does not exist', async () => {
        const response = await getPokemonByName('Missingno');

        expect(response.statusCode).toBe(404);
        expect(response.json<{ message: string }>()).toEqual({
            message: 'Could not find a pokemon for this name',
        });
    });

    it('returns the available pokemon types', async () => {
        const response = await getPokemonTypes();

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(Object.values(PokemonType));
    });

    it('rejects invalid pokemon pagination parameters', async () => {
        const response = await listPokemon({
            page: '0',
        });

        expect(response.statusCode).toBe(400);
    });
});
