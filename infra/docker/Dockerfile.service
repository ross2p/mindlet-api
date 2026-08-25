# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app

ENV HUSKY=0 \
    npm_config_fetch_timeout=600000 \
    npm_config_fetch_retries=10 \
    npm_config_maxsockets=3

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    sh -c 'set -e; for attempt in 1 2 3 4 5; do npm ci --prefer-offline --no-audit --no-fund && exit 0; echo "npm ci failed (attempt $attempt), retrying..."; sleep $((attempt * 20)); done; exit 1'

COPY . .
RUN npm run build

FROM node:22-alpine AS app
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
