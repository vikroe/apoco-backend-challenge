import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { MikroORM } from '@mikro-orm/postgresql';
import { buildOrmConfig } from '../models/dataSource.js';
import { PokemonSeeder } from '../models/seeders/pokemon.seeder.js';
import { getTestDbName, loadVitestEnv } from './env.js';

const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 1000;
const DOCKER_PROJECT_NAME = 'apoco-vitest';
const DOCKER_COMPOSE_FILE = 'docker-compose.vitest.yml';
const DOCKER_COMPOSE_PREFIX = `docker compose -p ${DOCKER_PROJECT_NAME} -f ${DOCKER_COMPOSE_FILE}`;
let dockerStopped = false;

const waitForPostgres = async (): Promise<void> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        try {
            execSync(
                `${DOCKER_COMPOSE_PREFIX} exec -T db pg_isready -U postgres -d postgres`,
                {
                    cwd: process.cwd(),
                    stdio: 'ignore',
                }
            );
            return;
        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw error;
            }

            console.log(`Waiting for postgres (${attempt}/${MAX_RETRIES})...`);
            await sleep(RETRY_DELAY_MS);
        }
    }
};

const recreateTestDatabase = async (): Promise<void> => {
    const testDbName = getTestDbName();

    if (testDbName === 'postgres') {
        throw new Error(
            'Test database must not match the management database.'
        );
    }

    const orm = await MikroORM.init(buildOrmConfig({ dbName: 'postgres' }));

    try {
        await orm.schema.dropDatabase(testDbName).catch(() => undefined);
        await orm.schema.createDatabase(testDbName);
    } finally {
        await orm.close(true);
    }
};

const migrateAndSeedDatabase = async (): Promise<void> => {
    const orm = await MikroORM.init(buildOrmConfig());

    try {
        await orm.migrator.up();
        await orm.seeder.seed(PokemonSeeder);
    } finally {
        await orm.close(true);
    }
};

const startVitestDocker = (): void => {
    console.log('Starting Docker postgres container...');
    execSync(`${DOCKER_COMPOSE_PREFIX} up -d db`, {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
};

const stopVitestDocker = (): void => {
    if (dockerStopped) {
        return;
    }

    dockerStopped = true;
    console.log('Stopping Docker postgres container...');
    execSync(`${DOCKER_COMPOSE_PREFIX} down -v`, {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
};

const registerDockerCleanup = (): void => {
    process.once('exit', stopVitestDocker);
};

export async function setup(): Promise<() => void> {
    loadVitestEnv();

    startVitestDocker();
    registerDockerCleanup();

    await waitForPostgres();
    await recreateTestDatabase();

    try {
        await migrateAndSeedDatabase();
    } catch (error) {
        stopVitestDocker();
        throw error;
    }

    return () => {
        stopVitestDocker();
    };
}
