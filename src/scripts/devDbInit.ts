import { MikroORM } from '@mikro-orm/postgresql';
import { buildOrmConfig } from '../models/dataSource.js';
import { Pokemon } from '../models/entities/pokemon.entity.js';
import { PokemonSeeder } from '../models/seeders/pokemon.seeder.js';

async function init() {
    console.log('Initializing database...');
    const orm = await MikroORM.init(buildOrmConfig());

    try {
        console.log('Applying database migrations...');
        await orm.migrator.up();
        console.log('Database migrations complete.');

        console.log('Checking whether pokemon data is already seeded...');
        const alreadySeeded = (await orm.em.fork().count(Pokemon, {})) > 0;
        if (!alreadySeeded) {
            console.log('Pokemon data not found. Running seeder...');
            await orm.seeder.seed(PokemonSeeder);
            console.log('Pokemon seeder completed.');
        } else {
            console.log('Pokemon data already present. Seeder skipped.');
        }
    } finally {
        console.log('Closing database connection...');
        await orm.close(true);
    }
}

init();
