# Build from **mindlet-api repository root**:
#   docker build -f docker/nest-app.Dockerfile --build-arg APP_DIR=apps/deck -t mindlet-deck .
#
# Uses local libs/common, libs/types, libs/database when present so unpublished changes apply.
FROM node:22-alpine AS builder
ARG APP_DIR
WORKDIR /workspace
RUN apk add --no-cache python3 make g++ openssl libc6-compat
COPY libs/common ./libs/common
COPY libs/types ./libs/types
COPY libs/database ./libs/database
COPY docker/patch-ross2p-deps.js ./docker/patch-ross2p-deps.js
COPY ${APP_DIR} ./app
WORKDIR /workspace/app
ENV HUSKY=0
ENV CI=true
RUN node ../docker/patch-ross2p-deps.js
RUN rm -f package-lock.json && npm install
RUN npm run build

FROM node:22-alpine AS app
WORKDIR /app
COPY --from=builder /workspace/app/dist ./dist
COPY --from=builder /workspace/app/package.json ./package.json
COPY --from=builder /workspace/app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
