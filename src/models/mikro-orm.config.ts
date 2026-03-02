import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { Attack } from './entities/attack.entity';
import { Pokemon } from './entities/pokemon.entity';
import { User } from './entities/user.entity';
import { Migration20260215160307_PokemonTable } from './migrations/Migration20260215160307_PokemonTable';
import { Migration20260227092326_UserEntity } from './migrations/Migration20260227092326_UserEntity';

const config: Options = {
    driver: PostgreSqlDriver,
    preferTs: true,
    entities: [Attack, Pokemon, User],
    entitiesTs: [Attack, Pokemon, User],
    migrations: {
        path: './build/models/migrations',
        pathTs: './src/models/migrations',
        migrationsList: [
            Migration20260215160307_PokemonTable,
            Migration20260227092326_UserEntity,
        ],
        tableName: 'migrations',
        transactional: true,
    },
    seeder: {
        path: './build/models/seeders',
        pathTs: './src/models/seeders',
        emit: 'ts',
    },
    metadataProvider: TsMorphMetadataProvider,
    extensions: [SeedManager],
};

export default config;
