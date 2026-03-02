import { MikroORM } from '@mikro-orm/postgresql';
import { buildOrmConfig } from '../models/dataSource.js';
import { Pokemon } from '../models/entities/pokemon.entity.js';
import { PokemonSeeder } from '../models/seeders/pokemon.seeder.js';

async function init() {
  const orm = await MikroORM.init(buildOrmConfig());

  try {
    await orm.migrator.up();

    const alreadySeeded = (await orm.em.fork().count(Pokemon, {})) > 0;
    if (!alreadySeeded) {
      await orm.seeder.seed(PokemonSeeder);
    }
  } finally {
    await orm.close(true);
  }
}

init();