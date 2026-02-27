import { PokemonType } from '../../models/entities/pokemon.entity';
import { SCHEMA_REGISTRY } from '../schemaRegistry';

const toTitleCaseType = (type: PokemonType): string => {
    const lowerCaseType = type.toLowerCase();
    return `${lowerCaseType.charAt(0).toUpperCase()}${lowerCaseType.slice(1)}`;
};

const POKEMON_TYPES = Object.values(PokemonType).map(toTitleCaseType);

export const POKEMON_SCHEMAS = [
    {
        $id: SCHEMA_REGISTRY.pokemon.getByIdParams,
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^\\d+$' },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.dimension,
        type: 'object',
        additionalProperties: false,
        required: ['minimum', 'maximum'],
        properties: {
            minimum: { type: 'string', minLength: 1 },
            maximum: { type: 'string', minLength: 1 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.evolutionRequirements,
        type: 'object',
        additionalProperties: false,
        required: ['amount', 'name'],
        properties: {
            amount: { type: 'integer', minimum: 1 },
            name: { type: 'string', minLength: 1 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.evolution,
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name'],
        properties: {
            id: { type: 'integer', minimum: 1 },
            name: { type: 'string', minLength: 1 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.attack,
        type: 'object',
        additionalProperties: false,
        required: ['name', 'type', 'damage'],
        properties: {
            name: { type: 'string', minLength: 1 },
            type: { type: 'string', enum: POKEMON_TYPES },
            damage: { type: 'integer', minimum: 1 },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.attacks,
        type: 'object',
        additionalProperties: false,
        required: ['fast', 'special'],
        properties: {
            fast: {
                type: 'array',
                items: { $ref: `${SCHEMA_REGISTRY.pokemon.attack}#` },
            },
            special: {
                type: 'array',
                items: { $ref: `${SCHEMA_REGISTRY.pokemon.attack}#` },
            },
        },
    },
    {
        $id: SCHEMA_REGISTRY.pokemon.response,
        type: 'object',
        additionalProperties: false,
        required: [
            'id',
            'name',
            'classification',
            'types',
            'resistant',
            'weaknesses',
            'weight',
            'height',
            'fleeRate',
            'maxCP',
            'maxHP',
            'attacks',
        ],
        properties: {
            id: { type: 'string', pattern: '^\\d{3}$' },
            name: { type: 'string', minLength: 1 },
            classification: { type: 'string', minLength: 1 },
            types: {
                type: 'array',
                items: { type: 'string', enum: POKEMON_TYPES },
            },
            resistant: {
                type: 'array',
                items: { type: 'string', enum: POKEMON_TYPES },
            },
            weaknesses: {
                type: 'array',
                items: { type: 'string', enum: POKEMON_TYPES },
            },
            weight: { $ref: `${SCHEMA_REGISTRY.pokemon.dimension}#` },
            height: { $ref: `${SCHEMA_REGISTRY.pokemon.dimension}#` },
            fleeRate: { type: 'number', minimum: 0 },
            previousEvolutions: {
                type: 'array',
                items: { $ref: `${SCHEMA_REGISTRY.pokemon.evolution}#` },
            },
            evolutionRequirements: {
                $ref: `${SCHEMA_REGISTRY.pokemon.evolutionRequirements}#`,
            },
            evolutions: {
                type: 'array',
                items: { $ref: `${SCHEMA_REGISTRY.pokemon.evolution}#` },
            },
            commonCaptureArea: { type: 'string', minLength: 1 },
            class: { type: 'string', minLength: 1 },
            maxCP: { type: 'integer', minimum: 1 },
            maxHP: { type: 'integer', minimum: 1 },
            attacks: { $ref: `${SCHEMA_REGISTRY.pokemon.attacks}#` },
        },
    },
] as const;
