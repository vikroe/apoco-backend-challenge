import type { FastifyInstance } from 'fastify';
import type { MikroORM, Options } from '@mikro-orm/postgresql';
import { afterAll } from 'vitest';
import { loadVitestEnv } from './env.js';

loadVitestEnv();

export interface TestBootstrap {
    app: FastifyInstance;
    orm: MikroORM;
}

export type TestOrmOverrides = Partial<Options>;

export const bootstrapTestApplication = async (
    ormOverrides: TestOrmOverrides = {}
): Promise<TestBootstrap> => {
    const { buildApplication } = await import('../application.js');
    const { initOrm } = await import('../models/dataSource.js');

    const orm = await initOrm(ormOverrides);
    const app = buildApplication();
    await app.ready();

    return {
        app,
        orm,
    };
};

export const teardownTestApplication = async (
    app?: FastifyInstance
): Promise<void> => {
    const { closeOrm } = await import('../models/dataSource.js');

    if (app) {
        await app.close();
        return;
    }

    await closeOrm();
};

afterAll(async () => {
    await teardownTestApplication();
});
