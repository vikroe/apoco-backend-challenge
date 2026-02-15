import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  driver: PostgreSqlDriver,
  dbName: 'apoco-pokemon',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: './src/migrations',
    tableName: 'migrations',
    transactional: true,
  },
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
};

export default config;