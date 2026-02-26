import { Migration } from '@mikro-orm/migrations';

export class Migration20260215160307_PokemonTable extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `create type "pokemon_type" as enum ('BUG', 'DARK', 'DRAGON', 'ELECTRIC', 'FAIRY', 'FIGHTING', 'FIRE', 'FLYING', 'GHOST', 'GRASS', 'GROUND', 'ICE', 'NORMAL', 'POISON', 'PSYCHIC', 'ROCK', 'STEEL', 'WATER');`
        );
        this.addSql(
            `create type "common_capture_area" as enum ('ASIA', 'AUSTRALIA_NEW_ZEALAND', 'NORTH_AMERICA', 'WESTERN_EUROPE');`
        );
        this.addSql(
            `create table "attack" ("id" serial primary key, "name" varchar(255) not null, "type" "pokemon_type" not null, "damage" int not null);`
        );
        this.addSql(
            `alter table "attack" add constraint "attack_name_type_damage_unique" unique ("name", "type", "damage");`
        );

        this.addSql(
            `create table "pokemon" ("id" varchar(255) not null, "name" varchar(255) not null, "classification" varchar(255) not null, "types" "pokemon_type"[] not null, "resistant" "pokemon_type"[] not null, "weaknesses" "pokemon_type"[] not null, "weight" jsonb not null, "height" jsonb not null, "flee_rate" double precision not null, "evolution_requirements" jsonb null, "max_cp" int not null, "max_hp" int not null, "common_capture_area" "common_capture_area" null, "pokemon_class" text check ("pokemon_class" in ('LEGENDARY', 'MYTHIC')) null, constraint "pokemon_pkey" primary key ("id"));`
        );

        this.addSql(
            `create table "pokemon_evolutions" ("pokemon_1_id" varchar(255) not null, "pokemon_2_id" varchar(255) not null, constraint "pokemon_evolutions_pkey" primary key ("pokemon_1_id", "pokemon_2_id"));`
        );

        this.addSql(
            `create table "pokemon_fast_attacks" ("pokemon_id" varchar(255) not null, "attack_id" int not null, constraint "pokemon_fast_attacks_pkey" primary key ("pokemon_id", "attack_id"));`
        );

        this.addSql(
            `create table "pokemon_special_attacks" ("pokemon_id" varchar(255) not null, "attack_id" int not null, constraint "pokemon_special_attacks_pkey" primary key ("pokemon_id", "attack_id"));`
        );

        this.addSql(
            `alter table "pokemon_evolutions" add constraint "pokemon_evolutions_pokemon_1_id_foreign" foreign key ("pokemon_1_id") references "pokemon" ("id") on update cascade on delete cascade;`
        );
        this.addSql(
            `alter table "pokemon_evolutions" add constraint "pokemon_evolutions_pokemon_2_id_foreign" foreign key ("pokemon_2_id") references "pokemon" ("id") on update cascade on delete cascade;`
        );

        this.addSql(
            `alter table "pokemon_fast_attacks" add constraint "pokemon_fast_attacks_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade on delete cascade;`
        );
        this.addSql(
            `alter table "pokemon_fast_attacks" add constraint "pokemon_fast_attacks_attack_id_foreign" foreign key ("attack_id") references "attack" ("id") on update cascade on delete cascade;`
        );

        this.addSql(
            `alter table "pokemon_special_attacks" add constraint "pokemon_special_attacks_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade on delete cascade;`
        );
        this.addSql(
            `alter table "pokemon_special_attacks" add constraint "pokemon_special_attacks_attack_id_foreign" foreign key ("attack_id") references "attack" ("id") on update cascade on delete cascade;`
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table "pokemon_fast_attacks" drop constraint "pokemon_fast_attacks_attack_id_foreign";`
        );

        this.addSql(
            `alter table "pokemon_special_attacks" drop constraint "pokemon_special_attacks_attack_id_foreign";`
        );

        this.addSql(
            `alter table "pokemon_evolutions" drop constraint "pokemon_evolutions_pokemon_1_id_foreign";`
        );

        this.addSql(
            `alter table "pokemon_evolutions" drop constraint "pokemon_evolutions_pokemon_2_id_foreign";`
        );

        this.addSql(
            `alter table "pokemon_fast_attacks" drop constraint "pokemon_fast_attacks_pokemon_id_foreign";`
        );

        this.addSql(
            `alter table "pokemon_special_attacks" drop constraint "pokemon_special_attacks_pokemon_id_foreign";`
        );

        this.addSql(`drop table if exists "attack" cascade;`);

        this.addSql(`drop table if exists "pokemon" cascade;`);

        this.addSql(`drop table if exists "pokemon_evolutions" cascade;`);

        this.addSql(`drop table if exists "pokemon_fast_attacks" cascade;`);

        this.addSql(`drop table if exists "pokemon_special_attacks" cascade;`);

        this.addSql(`drop type "pokemon_type";`);
        this.addSql(`drop type "common_capture_area";`);
    }
}
