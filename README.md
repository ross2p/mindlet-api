# mindlet-api

Monorepo of Mindlet backend services (**git submodules** under `apps/` and `libs/`), orchestrated with Docker Compose.

## Clone

```bash
git clone --recurse-submodules <url>
# or after clone:
git submodule update --init --recursive
```

## New microservices

Service repos are named `mindlet-<name>` (e.g. `mindlet-lesson`, `mindlet-course`). Create the repo on GitHub (manually or `gh repo create ross2p/mindlet-<name> --private`), add it as a submodule, then push from `apps/<name>`.

## Shared library `@ross2p/common`

Published on npm as [`@ross2p/common`](https://www.npmjs.com/package/@ross2p/common) (latest `0.2.1`) and [`@ross2p/types`](https://www.npmjs.com/package/@ross2p/types). Each app installs from the registry — **not** from `../../libs/*`:

```bash
cd apps/auth
npm install @ross2p/common @ross2p/types
```

After changing `libs/common` or `libs/types`, publish a new version and refresh apps:

```bash
cd libs/common && npm version patch && npm publish
npm run dev:bootstrap
```

## Local development

1. From this directory, install root dev tooling once: `npm install`
2. Install every app from npm: `npm run dev:bootstrap` (or `bash tools/dev-bootstrap.sh`)
3. Run a service: `cd apps/auth && npm run start:dev`

## Husky

Each submodule uses **husky 9** + **lint-staged** (`prepare` script). From a submodule directory:

```bash
npm install   # runs husky setup
```

## Docker Compose

The root [`docker-compose.yml`](docker-compose.yml) uses **Compose `include:`** to merge [`infra/platform/compose.yaml`](infra/platform/compose.yaml) (Kafka + UI) with one fragment per app under `apps/<name>/compose.yaml`. Per-service Postgres/Redis/Mongo run beside that service.

From this directory (Docker Desktop running):

```bash
cp .env.example .env   # optional overrides
docker compose up --build
```

Each service image is built from its own directory with `apps/<name>/Dockerfile`:

```bash
docker build -f apps/auth/Dockerfile -t mindlet-auth:dev apps/auth
```

- **Kafka UI**: http://localhost:3000  
- **HTTP APIs**: each service is on host port `3002`–`3015` (see `apps/*/compose.yaml`). For path-based routing like `/svc/<name>/`, use **Kubernetes + Ingress** (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

## Regenerate K8s / Compose fragments

After editing service metadata in [`tools/render-service-deploys.cjs`](tools/render-service-deploys.cjs):

```bash
node tools/render-service-deploys.cjs
```

## Kubernetes (local)

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** and the platform contract **[docs/PLATFORM_CONTRACT.md](docs/PLATFORM_CONTRACT.md)**.

## GitHub CLI

Optional: `brew install gh` for `gh repo create`, etc.
