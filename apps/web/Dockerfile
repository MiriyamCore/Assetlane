FROM node:20-slim AS base

WORKDIR /app

ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm install

COPY apps/web ./apps/web
RUN cd apps/web && npm run build

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "apps/web/dist", "-l", "5173"]
