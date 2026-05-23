# Build from **mindlet-api repository root**:
#   docker build -f tools/docker/nest-monorepo.Dockerfile --build-arg APP_DIR=apps/auth -t mindlet-auth:dev .
#
# Uses local libs/common, libs/types when present so unpublished changes apply.
FROM node:22-alpine AS builder
ARG APP_DIR
WORKDIR /workspace
RUN apk add --no-cache python3 make g++ openssl libc6-compat
COPY libs/common ./libs/common
COPY libs/types ./libs/types
COPY tools/docker/patch-ross2p-deps.js ./tools/docker/patch-ross2p-deps.js
COPY ${APP_DIR} ./app
WORKDIR /workspace/app
ENV HUSKY=0
ENV CI=true
RUN node /workspace/tools/docker/patch-ross2p-deps.js
RUN rm -f package-lock.json && npm install
RUN npm run build

FROM node:22-alpine AS app
WORKDIR /app
COPY --from=builder /workspace/libs /libs
COPY --from=builder /workspace/app/dist ./dist
COPY --from=builder /workspace/app/package.json ./package.json
COPY --from=builder /workspace/app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
