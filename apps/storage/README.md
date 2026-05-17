# Storage service

HTTP API for authenticated uploads to S3-compatible storage (MinIO in local Docker). Exposes `POST /storage/avatar` and `POST /storage/banner` under the global API prefix (`/api/v1/...` by default).

Authentication uses `AuthGuard` from `@ross2p/common`; the Kafka client for `AUTH_SERVICE` is registered by `CommonModule` (wired in `MicroServiceApplicationConfig`), so this app does not register a separate auth client module.

## Local development

1. Start MinIO and Kafka (see root `docker-compose.yml`).
2. Copy root `.env` from `.env.example` and ensure `STORAGE_ROOT_*` match MinIO credentials.
3. Set `STORAGE_ENDPOINT`, `STORAGE_PUBLIC_URL`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` when running outside Docker (see `docker-compose.yml` `storage-api` service for reference values).
4. From this directory: `npm install && npm run start:dev`

## Docker

Built from repo root with `docker/nest-app.Dockerfile` and `APP_DIR=apps/storage`.

The Compose **MinIO** service is named `storage` (hostname `storage`); the Nest app service is **`storage-api`** to avoid a duplicate Compose service key.
