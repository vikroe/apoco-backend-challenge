import {
    Loaded,
    NotFoundError,
    ObjectQuery,
    QueryOrder,
    raw,
} from '@mikro-orm/core';
import { getOrm } from '../../models/dataSource';
import type {
    PaginatedResponse,
    PaginationOptions,
} from '../../utils/pagination';
import { Pokemon, PokemonType } from '../../models/entities/pokemon.entity';
import { normalizePokemonId } from '../../utils/pokemon';

interface ListPokemonOptions extends PaginationOptions {
    userId: string;
    types: PokemonType[];
    name?: string;
    favorites?: boolean;
}

type PokemonWithRelations = Loaded<
    Pokemon,
    | 'evolutions'
    | 'previousEvolutions'
    | 'fastAttacks'
    | 'specialAttacks'
    | 'favoritedUsers'
>;

const POKEMON_RELATIONS = [
    'evolutions',
    'previousEvolutions',
    'fastAttacks',
    'specialAttacks',
    'favoritedUsers',
] as const;
const NUMERIC_POKEMON_ID_ORDER = raw(alias => `cast(${alias}.id as integer)`);

const getFavoritedWhereCondition = (
    userId: string,
    favorites?: boolean
): ObjectQuery<Pokemon> => {
    if (favorites != null) {
        return {
            favoritedUsers: favorites
                ? { $some: { id: userId } }
                : { $none: { id: userId } },
        };
    }

    return {};
};

export const listPokemon = async ({
    userId,
    page,
    limit,
    types,
    name,
    favorites,
}: ListPokemonOptions): Promise<PaginatedResponse<PokemonWithRelations>> => {
    const em = getOrm().em.fork();
    const offset = (page - 1) * limit;
    const normalizedTypes = types.map(
        type => type.toUpperCase() as PokemonType
    );
    const where: ObjectQuery<Pokemon> = {
        ...(normalizedTypes.length > 0
            ? { types: { $contains: normalizedTypes } }
            : {}),
        ...(name ? { name: { $ilike: `%${name}%` } } : {}),
        ...getFavoritedWhereCondition(userId, favorites),
    };
    const [pokemons, total] = await em.findAndCount(Pokemon, where, {
        populate: POKEMON_RELATIONS,
        orderBy: { [NUMERIC_POKEMON_ID_ORDER]: QueryOrder.ASC },
        limit,
        offset,
    });

    return {
        data: pokemons,
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
};

export const getPokemonById = async (
    id: string
): Promise<PokemonWithRelations> => {
    const orm = getOrm();
    const em = orm.em.fork();

    const normalizedId = normalizePokemonId(id);
    const pokemon = await em.findOne(
        Pokemon,
        { id: normalizedId },
        { populate: POKEMON_RELATIONS }
    );

    if (!pokemon) {
        throw new NotFoundError(
            'Could not find a pokemon for this ID',
            Pokemon
        );
    }

    return pokemon;
};

export const getPokemonByName = async (
    name: string
): Promise<PokemonWithRelations> => {
    const em = getOrm().em.fork();
    const normalizedName = name.trim();

    const pokemon = await em.findOne(
        Pokemon,
        { name: { $ilike: normalizedName } },
        { populate: POKEMON_RELATIONS }
    );

    if (!pokemon) {
        throw new NotFoundError(
            'Could not find a pokemon for this name',
            Pokemon
        );
    }

    return pokemon;
};

export const listPokemonTypes = (): PokemonType[] => Object.values(PokemonType);
