import { NotFoundError } from '@mikro-orm/core';
import { getOrm } from '../../models/dataSource';
import { Pokemon } from '../../models/entities/pokemon.entity';
import { User } from '../../models/entities/user.entity';
import { normalizePokemonId } from '../../utils/pokemon';

interface SetFavoritePokemonParams {
    userId: string;
    id: string;
    unset?: boolean;
}

export const setFavoritePokemon = async ({
    userId,
    id,
    unset = false,
}: SetFavoritePokemonParams): Promise<boolean> => {
    const em = getOrm().em.fork();
    const normalizedId = normalizePokemonId(id);
    const user = await em.findOne(
        User,
        { id: userId },
        { populate: ['favoritePokemon'] }
    );

    if (!user) {
        throw new NotFoundError('Could not find a user for this ID', User);
    }

    const pokemon = await em.findOne(Pokemon, { id: normalizedId });
    if (!pokemon) {
        throw new NotFoundError(
            'Could not find a pokemon for this ID',
            Pokemon
        );
    }

    const isFavorited = user.favoritePokemon.contains(pokemon);
    if (unset) {
        if (!isFavorited) {
            return false;
        }

        user.favoritePokemon.remove(pokemon);
    } else {
        if (isFavorited) {
            return false;
        }

        user.favoritePokemon.add(pokemon);
    }

    await em.flush();

    return true;
};
