import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
@Unique({ properties: ['email'] })
export class User {
    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ length: 64 })
    email!: string;

    @Property({ length: 256 })
    passwordHash!: string;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
