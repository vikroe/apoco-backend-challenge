import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';

const config: Options = {
  driver: PostgreSqlDriver,
  preferTs: false,
  entities: ['build/models/entities/*.js'],
  entitiesTs: ['src/models/entities/*.ts'],
  migrations: {
    path: './build/models/migrations',
    pathTs: './src/models/migrations',
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