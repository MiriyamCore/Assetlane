FROM node:20-slim AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm install

# Build
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npm run build

EXPOSE 5001

CMD ["node", "apps/api/dist/index.js"]
