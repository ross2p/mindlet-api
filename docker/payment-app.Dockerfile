# Payment service: no @ross2p path deps; build from **repo root** with APP_DIR=apps/payment.
FROM node:22-alpine AS builder
ARG APP_DIR=apps/payment
WORKDIR /workspace
RUN apk add --no-cache python3 make g++ openssl libc6-compat
COPY ${APP_DIR} ./app
WORKDIR /workspace/app
ENV HUSKY=0
ENV CI=true
RUN rm -f package-lock.json && npm install || npm install
RUN npm run build

FROM node:22-alpine AS app
WORKDIR /app
COPY --from=builder /workspace/app/dist ./dist
COPY --from=builder /workspace/app/package.json ./package.json
COPY --from=builder /workspace/app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
