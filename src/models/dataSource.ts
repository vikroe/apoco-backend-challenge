import { MikroORM, Options } from '@mikro-orm/postgresql';
import config from './mikro-orm.config';

let orm: MikroORM | undefined;

export type OrmConfigOverrides = Partial<Options>;

export const buildOrmConfig = (overrides: OrmConfigOverrides = {}): Options => {
    return {
        ...config,
        ...overrides,
        migrations: {
            ...config.migrations,
            ...overrides.migrations,
        },
        seeder: {
            ...config.seeder,
            ...overrides.seeder,
        },
    };
};

export async function initOrm(
    overrides: OrmConfigOverrides = {}
): Promise<MikroORM> {
    if (!orm) {
        orm = await MikroORM.init(buildOrmConfig(overrides));
    }

    return orm;
}

export function getOrm(): MikroORM {
    if (!orm) {
        throw new Error('ORM has not been initialized. Call initOrm() first.');
    }

    return orm;
}

export async function closeOrm(): Promise<void> {
    if (!orm) return;

    if (await orm.isConnected()) {
        await orm.close();
    }

    orm = undefined;
}
