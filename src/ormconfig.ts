import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { entities } from './entities';

dotenv.config();

export const migrationFolder = '../../migrations/**/*.{ts,js}';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT!,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  entities: entities,
  migrations: [migrationFolder],
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
