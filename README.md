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

`libs/common` includes Kafka service names (`Services` enum). Docker builds from the repo root use [`tools/docker/nest-monorepo.Dockerfile`](tools/docker/nest-monorepo.Dockerfile) and [`tools/docker/patch-ross2p-deps.js`](tools/docker/patch-ross2p-deps.js) to rewrite `@ross2p/*` to `file:../libs/*`, so **you do not need to publish to npm** for local Compose builds.

## Local development (linked libs, no npm publish)

Apps declare `@ross2p/common` and `@ross2p/types` as **`file:../../libs/...`** (npm installs from the local submodule directories; on npm 7+ this is typically a symlink to `libs/*`).

1. From this directory, install root dev tooling once: `npm install`
2. Build all libs and reinstall every app: `npm run dev:bootstrap` (or `bash tools/dev-bootstrap.sh`)
3. In a second terminal, watch-rebuild both libs while you work: `npm run dev:watch-libs`
4. In a third terminal, run a service: `cd apps/auth && npm run start:dev`

Shared packages use **peerDependencies** for Nest and `@ross2p/*` so the host app supplies a single copy (avoids Nest DI issues). After changing **dependencies** inside a lib, run `npm install` again in affected apps.

If you run `npm install` inside `libs/common` or `libs/types` and then see TypeScript errors about incompatible `NestExpressApplication` types, prune duplicate runtime Nest packages from that lib (same as bootstrap): remove only `node_modules/@nestjs/common`, `core`, `platform-express`, `microservices`, `swagger`, `config`, and `testing` under the lib — **not** the whole `@nestjs` folder (that would remove `@nestjs/cli`).

To consume from npm in other environments, publish a new version from `libs/common` after changes:

```bash
cd libs/common && npm version patch && npm publish
```

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
