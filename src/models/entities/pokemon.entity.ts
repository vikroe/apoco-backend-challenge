import {
    Collection,
    Entity,
    Enum,
    ManyToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Attack } from './attack.entity';
import { User } from './user.entity';

@Entity()
export class Pokemon {
    @PrimaryKey({ type: 'varchar(3)' })
    id!: string;

    @Property()
    name!: string;

    @Property()
    classification!: string;

    @Enum({
        items: () => PokemonType,
        array: true,
        nativeEnumName: 'pokemon_type',
    })
    types!: PokemonType[];

    @Enum({
        items: () => PokemonType,
        array: true,
        nativeEnumName: 'pokemon_type',
    })
    resistant!: PokemonType[];

    @Enum({
        items: () => PokemonType,
        array: true,
        nativeEnumName: 'pokemon_type',
    })
    weaknesses!: PokemonType[];

    @Property({ type: 'json' })
    weight!: PokemonDimension;

    @Property({ type: 'json' })
    height!: PokemonDimension;

    @Property({ type: 'double precision' })
    fleeRate!: number;

    @Property({ type: 'json', nullable: true })
    evolutionRequirements?: PokemonEvolutionRequirements;

    @ManyToMany(() => Pokemon, pokemon => pokemon.previousEvolutions, {
        owner: true,
    })
    evolutions = new Collection<Pokemon>(this);

    @ManyToMany(() => Pokemon, pokemon => pokemon.evolutions)
    previousEvolutions = new Collection<Pokemon>(this);

    @Property()
    maxCP!: number;

    @Property()
    maxHP!: number;

    @ManyToMany(() => Attack, attack => attack.fastAttackPokemons, {
        owner: true,
        pivotTable: 'pokemon_fast_attacks',
    })
    fastAttacks = new Collection<Attack>(this);

    @ManyToMany(() => Attack, attack => attack.specialAttackPokemons, {
        owner: true,
        pivotTable: 'pokemon_special_attacks',
    })
    specialAttacks = new Collection<Attack>(this);

    @ManyToMany(() => User, user => user.favoritePokemon)
    favoritedUsers = new Collection<User>(this);

    @Enum({
        items: () => PokemonCaptureArea,
        nullable: true,
        nativeEnumName: 'common_capture_area',
    })
    commonCaptureArea?: PokemonCaptureArea;

    @Enum({ items: () => PokemonClass, nullable: true })
    pokemonClass?: PokemonClass;
}

export enum PokemonType {
    BUG = 'BUG',
    DARK = 'DARK',
    DRAGON = 'DRAGON',
    ELECTRIC = 'ELECTRIC',
    FAIRY = 'FAIRY',
    FIGHTING = 'FIGHTING',
    FIRE = 'FIRE',
    FLYING = 'FLYING',
    GHOST = 'GHOST',
    GRASS = 'GRASS',
    GROUND = 'GROUND',
    ICE = 'ICE',
    NORMAL = 'NORMAL',
    POISON = 'POISON',
    PSYCHIC = 'PSYCHIC',
    ROCK = 'ROCK',
    STEEL = 'STEEL',
    WATER = 'WATER',
}

export enum PokemonCaptureArea {
    ASIA = 'ASIA',
    AUSTRALIA_NEW_ZEALAND = 'AUSTRALIA_NEW_ZEALAND',
    NORTH_AMERICA = 'NORTH_AMERICA',
    WESTERN_EUROPE = 'WESTERN_EUROPE',
}

export enum PokemonClass {
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC',
}

export interface PokemonDimension {
    minimum: string;
    maximum: string;
}

export interface PokemonEvolutionRequirements {
    amount: number;
    name: string;
}
