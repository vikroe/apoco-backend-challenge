import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const VITEST_ENV_PATH = resolve(process.cwd(), '.env.vitest');
let loaded = false;

export const loadVitestEnv = (): void => {
    if (loaded) {
        return;
    }

    if (!existsSync(VITEST_ENV_PATH)) {
        throw new Error('Could not load test env variables from .env.vitest.');
    }

    process.loadEnvFile(VITEST_ENV_PATH);
    loaded = true;
};

export const getRequiredEnv = (name: string): string => {
    loadVitestEnv();

    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} env variable is required.`);
    }

    return value;
};

export const getTestDbName = (): string => {
    return getRequiredEnv('MIKRO_ORM_DB_NAME');
};
