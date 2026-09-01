import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { resolveDatabaseConfig } from './scripts/database-provider.mjs';

const database = resolveDatabaseConfig();

export default defineConfig({
  schema: database.schema,
  migrations: {
    path: database.migrationsPath,
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: database.url,
  },
});
