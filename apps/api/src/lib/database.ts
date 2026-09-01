export type DatabaseProvider = 'sqlite' | 'postgresql';

type DatabaseEnv = {
  DATABASE_URL?: string;
  DATABASE_PROVIDER?: string;
};

export const getDatabaseUrl = (env: DatabaseEnv = process.env) => env.DATABASE_URL || 'file:./assetlane.db';

export const getDatabaseProvider = (env: DatabaseEnv = process.env): DatabaseProvider => {
  const explicitProvider = env.DATABASE_PROVIDER?.trim().toLowerCase();

  if (explicitProvider === 'postgresql' || explicitProvider === 'postgres') {
    return 'postgresql';
  }

  if (explicitProvider === 'sqlite') {
    return 'sqlite';
  }

  const url = getDatabaseUrl(env);
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    return 'postgresql';
  }

  return 'sqlite';
};

export const isPostgresDatabase = (env: DatabaseEnv = process.env) => getDatabaseProvider(env) === 'postgresql';
