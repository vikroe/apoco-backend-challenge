import { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { Attack } from "../entities/attack.entity";
import { Pokemon, PokemonCaptureArea, PokemonClass, PokemonType } from "../entities/pokemon.entity";

interface RawEvolutionRequirements {
    amount: number;
    name: string;
}

interface RawEvolution {
    id: number;
    name: string;
}

interface RawAttack {
    name: string;
    type: string;
    damage: number;
}

interface RawPokemon {
    id: string;
    name: string;
    classification: string;
    types: string[];
    resistant: string[];
    weaknesses: string[];
    weight: {
        minimum: string;
        maximum: string;
    };
    height: {
        minimum: string;
        maximum: string;
    };
    fleeRate: number;
    evolutionRequirements?: RawEvolutionRequirements;
    evolutions?: RawEvolution[];
    attacks: {
        fast: RawAttack[];
        special: RawAttack[];
    };
    maxCP: number;
    maxHP: number;
    "Common Capture Area"?: string;
    Asia?: string;
    "North America"?: string;
    "Australia, New Zealand"?: string;
    "Western Europe"?: string;
    "Pokémon Class"?: string;
    LEGENDARY?: string;
    MYTHIC?: string;
}

export class PokemonSeeder extends Seeder {
    public async run(em: EntityManager): Promise<void> {
        const pokemonsData = await this.loadPokemonsData();
        const pokemonById = new Map<string, Pokemon>();
        const attackByKey = new Map<string, Attack>();

        for (const data of pokemonsData) {
            const pokemon = em.create(Pokemon, {
                id: toPokemonId(data.id),
                name: data.name,
                classification: data.classification,
                types: data.types.map(toPokemonType),
                resistant: data.resistant.map(toPokemonType),
                weaknesses: data.weaknesses.map(toPokemonType),
                weight: data.weight,
                height: data.height,
                fleeRate: data.fleeRate,
                evolutionRequirements: data.evolutionRequirements,
                maxCP: data.maxCP,
                maxHP: data.maxHP,
                commonCaptureArea: toCaptureArea(data),
                pokemonClass: toPokemonClass(data),
            });

            pokemonById.set(pokemon.id, pokemon);
            em.persist(pokemon);
        }

        for (const data of pokemonsData) {
            const sourcePokemon = pokemonById.get(toPokemonId(data.id));
            if (!sourcePokemon) {
                continue;
            }

            for (const evolution of data.evolutions ?? []) {
                const targetPokemon = pokemonById.get(toPokemonId(evolution.id));
                if (targetPokemon) {
                    sourcePokemon.evolutions.add(targetPokemon);
                }
            }

            for (const attackData of data.attacks.fast) {
                sourcePokemon.fastAttacks.add(this.getOrCreateAttack(em, attackByKey, attackData));
            }

            for (const attackData of data.attacks.special) {
                sourcePokemon.specialAttacks.add(this.getOrCreateAttack(em, attackByKey, attackData));
            }
        }

        await em.flush();
    }

    private async loadPokemonsData(): Promise<RawPokemon[]> {
        const filePath = join(process.cwd(), "resources", "pokemons.json");
        const rawJson = await fs.readFile(filePath, "utf8");

        return JSON.parse(rawJson) as RawPokemon[];
    }

    private getOrCreateAttack(
        em: EntityManager,
        attackByKey: Map<string, Attack>,
        data: RawAttack,
    ): Attack {
        const attackType = toPokemonType(data.type);
        const key = `${data.name}|${attackType}|${data.damage}`;
        const existingAttack = attackByKey.get(key);

        if (existingAttack) {
            return existingAttack;
        }

        const attack = em.create(Attack, {
            name: data.name,
            type: attackType,
            damage: data.damage,
        });

        attackByKey.set(key, attack);
        em.persist(attack);

        return attack;
    }
}

const toPokemonId = (id: string | number): string => String(Number(id));

const toPokemonType = (value: string): PokemonType => {
    const key = value.toUpperCase() as keyof typeof PokemonType;
    const pokemonType = PokemonType[key];

    if (!pokemonType) {
        throw new Error(`Unsupported Pokemon type: ${value}`);
    }

    return pokemonType;
};

const toCaptureArea = (pokemon: RawPokemon): PokemonCaptureArea | undefined => {
    if (pokemon.Asia) {
        return PokemonCaptureArea.ASIA;
    }

    if (pokemon["Australia, New Zealand"]) {
        return PokemonCaptureArea.AUSTRALIA_NEW_ZEALAND;
    }

    if (pokemon["North America"]) {
        return PokemonCaptureArea.NORTH_AMERICA;
    }

    if (pokemon["Western Europe"]) {
        return PokemonCaptureArea.WESTERN_EUROPE;
    }

    return undefined;
};

const toPokemonClass = (pokemon: RawPokemon): PokemonClass | undefined => {
    if (pokemon.LEGENDARY) {
        return PokemonClass.LEGENDARY;
    }

    if (pokemon.MYTHIC) {
        return PokemonClass.MYTHIC;
    }

    return undefined;
};
