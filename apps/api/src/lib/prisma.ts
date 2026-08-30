import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'assetlane.db';
const adapter = new PrismaBetterSqlite3({ url: dbPath } as any);

const prisma = new PrismaClient({ 
  adapter 
} as any);

export default prisma;
