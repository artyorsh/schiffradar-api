import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

const createDataSourceOptions = (
  options: Omit<PostgresConnectionOptions, 'type'> = {},
): PostgresConnectionOptions => ({
  ...options,
  type: 'postgres',
  synchronize: true,
  dropSchema: true,
  migrations: [path.join(__dirname, 'migrations/*.ts')],
});

export const createRootTypeOrmModule = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  autoLoadEntities: true,
  ...createDataSourceOptions({
    host: 'localhost',
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USER', 'schiffradar'),
    password: configService.get('DB_PASSWORD', 'schiffradar'),
    database: configService.get('DB_NAME', 'schiffradar'),
    logging: false,
  }),
});

export default new DataSource(
  createDataSourceOptions({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || ''),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }),
);
