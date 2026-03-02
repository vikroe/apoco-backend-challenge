import {
    Collection,
    Entity,
    ManyToMany,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { Pokemon } from './pokemon.entity';

@Entity({ tableName: 'users' })
@Unique({ properties: ['email'] })
export class User {
    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ length: 64 })
    email!: string;

    @Property({ length: 256 })
    passwordHash!: string;

    @ManyToMany(() => Pokemon, pokemon => pokemon.favoritedUsers, {
        owner: true,
        pivotTable: 'user_favorite_pokemon',
    })
    favoritePokemon = new Collection<Pokemon>(this);

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
