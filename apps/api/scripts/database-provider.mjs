/**
 * Shared database provider resolution for Prisma CLI and runtime.
 */

export function resolveDatabaseConfig(env = process.env) {
  const url = env.DATABASE_URL || 'file:./assetlane.db';
  const explicitProvider = env.DATABASE_PROVIDER?.trim().toLowerCase();

  let provider = 'sqlite';
  if (explicitProvider === 'postgresql' || explicitProvider === 'postgres') {
    provider = 'postgresql';
  } else if (explicitProvider === 'sqlite') {
    provider = 'sqlite';
  } else if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    provider = 'postgresql';
  }

  return {
    provider,
    url,
    schema: provider === 'postgresql' ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma',
    migrationsPath: provider === 'postgresql' ? 'prisma/migrations-postgresql' : 'prisma/migrations',
  };
}
