import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getEnvValue } from '../utils/env';

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

export const getTestDbName = (): string => {
    return getEnvValue('MIKRO_ORM_DB_NAME');
};
