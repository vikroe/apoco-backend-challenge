import { Migration } from '@mikro-orm/migrations';

export class Migration20260227092326_UserEntity extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "email" varchar(64) not null, "password_hash" varchar(256) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}
