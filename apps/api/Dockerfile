FROM node:20-slim AS base

WORKDIR /app

ARG DATABASE_PROVIDER=sqlite
ENV DATABASE_PROVIDER=${DATABASE_PROVIDER}

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm install

COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build
RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 5001

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
