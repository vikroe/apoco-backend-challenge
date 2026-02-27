import { Loaded, NotFoundError } from '@mikro-orm/core';
import { getOrm } from '../../models/dataSource';
import { Pokemon } from '../../models/entities/pokemon.entity';

type PokemonWithRelations = Loaded<
    Pokemon,
    'evolutions' | 'previousEvolutions' | 'fastAttacks' | 'specialAttacks'
>;

export const getPokemonById = async (
    id: string
): Promise<PokemonWithRelations> => {
    const orm = await getOrm();
    const em = orm.em.fork();

    const normalizedId = id.trim().replace(/^0+/, '') || '0';
    const pokemon = await em.findOne(
        Pokemon,
        { id: normalizedId },
        {
            populate: [
                'evolutions',
                'previousEvolutions',
                'fastAttacks',
                'specialAttacks',
            ],
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
