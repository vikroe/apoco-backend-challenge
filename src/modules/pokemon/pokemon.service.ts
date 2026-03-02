import { Loaded, NotFoundError, QueryOrder, raw } from '@mikro-orm/core';
import { getOrm } from '../../models/dataSource';
import type {
    PaginatedResponse,
    PaginationOptions,
} from '../../utils/pagination';
import { Pokemon, PokemonType } from '../../models/entities/pokemon.entity';

interface ListPokemonOptions extends PaginationOptions {
    types: PokemonType[];
    name?: string;
}

type PokemonWithRelations = Loaded<
    Pokemon,
    'evolutions' | 'previousEvolutions' | 'fastAttacks' | 'specialAttacks'
>;

const POKEMON_RELATIONS = [
    'evolutions',
    'previousEvolutions',
    'fastAttacks',
    'specialAttacks',
] as const;
const NUMERIC_POKEMON_ID_ORDER = raw(alias => `cast(${alias}.id as integer)`);

export const listPokemon = async ({
    page,
    limit,
    types,
    name,
}: ListPokemonOptions): Promise<PaginatedResponse<PokemonWithRelations>> => {
    const em = getOrm().em.fork();
    const offset = (page - 1) * limit;
    const normalizedTypes = types.map(
        type => type.toUpperCase() as PokemonType
    );
    const where = {
        ...(normalizedTypes.length > 0
            ? { types: { $contains: normalizedTypes } }
            : {}),
        ...(name ? { name: { $ilike: `%${name}%` } } : {}),
    };
    const [pokemons, total] = await em.findAndCount(Pokemon, where, {
        populate: POKEMON_RELATIONS,
        orderBy: {
            [NUMERIC_POKEMON_ID_ORDER]: QueryOrder.ASC,
        },
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

    const normalizedId = id.trim().replace(/^0+/, '') || '0';
    const pokemon = await em.findOne(
        Pokemon,
        { id: normalizedId },
        {
            populate: POKEMON_RELATIONS,
        }
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
        {
            populate: POKEMON_RELATIONS,
        }
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
