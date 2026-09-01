#!/bin/sh
set -e

cd /app/apps/api

if [ "${DATABASE_PROVIDER}" = "postgresql" ] || printf '%s' "${DATABASE_URL}" | grep -Eq '^postgres(ql)?://'; then
  echo "Applying PostgreSQL migrations..."
  npx prisma migrate deploy
fi

exec node dist/index.js
