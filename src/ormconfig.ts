import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { entities } from './entities';

dotenv.config();

export const migrationFolder = 'src/migrations/**/*.{ts,js}';

export default new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE!,
  entities: entities,
  migrations: [migrationFolder],
});
