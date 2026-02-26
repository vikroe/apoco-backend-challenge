import {
    Collection,
    Entity,
    Enum,
    ManyToMany,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { Pokemon, PokemonType } from './pokemon.entity';

@Entity()
@Unique({ properties: ['name', 'type', 'damage'] })
export class Attack {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string;

    @Enum({ items: () => PokemonType, nativeEnumName: 'pokemon_type' })
    type!: PokemonType;

    @Property()
    damage!: number;

    @ManyToMany(() => Pokemon, pokemon => pokemon.fastAttacks)
    fastAttackPokemons = new Collection<Pokemon>(this);

    @ManyToMany(() => Pokemon, pokemon => pokemon.specialAttacks)
    specialAttackPokemons = new Collection<Pokemon>(this);
}
