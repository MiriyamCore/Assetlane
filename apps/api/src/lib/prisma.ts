import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { getDatabaseProvider, getDatabaseUrl } from './database';

dotenv.config();

const createPrismaClient = () => {
  const provider = getDatabaseProvider();
  const databaseUrl = getDatabaseUrl();

  if (provider === 'postgresql') {
    const pool = new pg.Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
  }

  const sqlitePath = databaseUrl.replace(/^file:/, '');
  const adapter = new PrismaBetterSqlite3({ url: sqlitePath } as any);
  return new PrismaClient({ adapter } as any);
};

const prisma = createPrismaClient();

export default prisma;
