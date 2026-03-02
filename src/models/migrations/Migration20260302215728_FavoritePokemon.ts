import { Migration } from '@mikro-orm/migrations';

export class Migration20260302215728_FavoritePokemon extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `create table "user_favorite_pokemon" ("user_id" uuid not null, "pokemon_id" varchar(255) not null, constraint "user_favorite_pokemon_pkey" primary key ("user_id", "pokemon_id"));`
        );

        this.addSql(
            `alter table "user_favorite_pokemon" add constraint "user_favorite_pokemon_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`
        );
        this.addSql(
            `alter table "user_favorite_pokemon" add constraint "user_favorite_pokemon_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade on delete cascade;`
        );
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "user_favorite_pokemon" cascade;`);
    }
}
