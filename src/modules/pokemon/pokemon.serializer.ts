import { Loaded } from '@mikro-orm/core';
import { Attack } from '../../models/entities/attack.entity';
import {
    Pokemon,
    PokemonCaptureArea,
    PokemonType,
} from '../../models/entities/pokemon.entity';

type PokemonWithRelations = Loaded<
    Pokemon,
    'evolutions' | 'previousEvolutions' | 'fastAttacks' | 'specialAttacks'
>;

interface PokemonEvolutionResponse {
    id: number;
    name: string;
}

interface PokemonAttackResponse {
    name: string;
    type: string;
    damage: number;
}

interface PokemonDimensionResponse {
    minimum: string;
    maximum: string;
}

interface PokemonEvolutionRequirementsResponse {
    amount: number;
    name: string;
}

export interface PokemonResponse {
    id: string;
    name: string;
    classification: string;
    types: string[];
    resistant: string[];
    weaknesses: string[];
    weight: PokemonDimensionResponse;
    height: PokemonDimensionResponse;
    fleeRate: number;
    'Previous evolution(s)'?: PokemonEvolutionResponse[];
    evolutionRequirements?: PokemonEvolutionRequirementsResponse;
    evolutions?: PokemonEvolutionResponse[];
    'Common Capture Area'?: string;
    'Pokémon Class'?: string;
    maxCP: number;
    maxHP: number;
    attacks: {
        fast: PokemonAttackResponse[];
        special: PokemonAttackResponse[];
    };
}

type PokemonResponseWithoutStats = Omit<
    PokemonResponse,
    'maxCP' | 'maxHP' | 'attacks'
>;

type PokemonCaptureAreaKey =
    | 'Asia'
    | 'Australia, New Zealand'
    | 'North America'
    | 'Western Europe';

const CAPTURE_AREA_KEYS: Record<PokemonCaptureArea, PokemonCaptureAreaKey> = {
    [PokemonCaptureArea.ASIA]: 'Asia',
    [PokemonCaptureArea.AUSTRALIA_NEW_ZEALAND]: 'Australia, New Zealand',
    [PokemonCaptureArea.NORTH_AMERICA]: 'North America',
    [PokemonCaptureArea.WESTERN_EUROPE]: 'Western Europe',
};

const toCaptureAreaDescription = (area: PokemonCaptureAreaKey): string => {
    return `Early reports that this Pokémon is likely to be found in: ${area}`;
};

const toTitleCaseType = (type: PokemonType): string => {
    const lowerCasedType = type.toLowerCase();
    return `${lowerCasedType.charAt(0).toUpperCase()}${lowerCasedType.slice(1)}`;
};

const toPublicAttack = (attack: Attack): PokemonAttackResponse => {
    return {
        name: attack.name,
        type: toTitleCaseType(attack.type),
        damage: attack.damage,
    };
};

const sortByAttackName = (
    left: PokemonAttackResponse,
    right: PokemonAttackResponse
): number => {
    return (
        left.name.localeCompare(right.name) ||
        left.type.localeCompare(right.type) ||
        left.damage - right.damage
    );
};

const toPublicEvolutions = (
    pokemons: Pokemon[]
): PokemonEvolutionResponse[] => {
    return pokemons
        .map(pokemon => ({
            id: Number(pokemon.id),
            name: pokemon.name,
        }))
        .sort((left, right) => left.id - right.id);
};

const formatPokemonId = (id: string): string => {
    return id.padStart(3, '0');
};

export const serializePokemon = (
    pokemon: PokemonWithRelations
): PokemonResponse => {
    const serializedPokemon: PokemonResponseWithoutStats &
        Partial<Pick<PokemonResponse, 'maxCP' | 'maxHP' | 'attacks'>> = {
        id: formatPokemonId(pokemon.id),
        name: pokemon.name,
        classification: pokemon.classification,
        types: pokemon.types.map(toTitleCaseType),
        resistant: pokemon.resistant.map(toTitleCaseType),
        weaknesses: pokemon.weaknesses.map(toTitleCaseType),
        weight: pokemon.weight,
        height: pokemon.height,
        fleeRate: pokemon.fleeRate,
    };

    const previousEvolutions = toPublicEvolutions(
        pokemon.previousEvolutions.getItems()
    );
    if (previousEvolutions.length > 0) {
        serializedPokemon['Previous evolution(s)'] = previousEvolutions;
    }

    if (pokemon.evolutionRequirements) {
        serializedPokemon.evolutionRequirements = pokemon.evolutionRequirements;
    }

    const evolutions = toPublicEvolutions(pokemon.evolutions.getItems());
    if (evolutions.length > 0) {
        serializedPokemon.evolutions = evolutions;
    }

    if (pokemon.commonCaptureArea) {
        const captureAreaKey = CAPTURE_AREA_KEYS[pokemon.commonCaptureArea];
        serializedPokemon['Common Capture Area'] =
            toCaptureAreaDescription(captureAreaKey);
    }

    if (pokemon.pokemonClass) {
        serializedPokemon['Pokémon Class'] =
            `This is a ${pokemon.pokemonClass} Pokémon.`;
    }

    serializedPokemon.maxCP = pokemon.maxCP;
    serializedPokemon.maxHP = pokemon.maxHP;
    serializedPokemon.attacks = {
        fast: pokemon.fastAttacks
            .getItems()
            .map(toPublicAttack)
            .sort(sortByAttackName),
        special: pokemon.specialAttacks
            .getItems()
            .map(toPublicAttack)
            .sort(sortByAttackName),
    };

    return serializedPokemon as PokemonResponse;
};
