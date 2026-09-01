export const buildAllowedOrigins = (baseUrl: string) => {
  const origins = new Set<string>([baseUrl]);

  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname === 'localhost') {
      origins.add(`${parsed.protocol}//127.0.0.1${parsed.port ? `:${parsed.port}` : ''}`);
    }
    if (parsed.hostname === '127.0.0.1') {
      origins.add(`${parsed.protocol}//localhost${parsed.port ? `:${parsed.port}` : ''}`);
    }
  } catch {
    // Ignore invalid FRONTEND_URL values and fall back to the raw string.
  }

  return origins;
};
