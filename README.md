# mindlet-api

Monorepo of Mindlet backend services (**git submodules** under `apps/` and `libs/`), orchestrated with Docker Compose.

## Clone

```bash
git clone --recurse-submodules <url>
# or after clone:
git submodule update --init --recursive
```

## New microservices (deck, ai, study, collaboration, analytics)

Remote GitHub repos are named `mindlet-<name>` (e.g. `mindlet-deck`). If they do not exist yet:

```bash
export PATH="/opt/homebrew/bin:$PATH"
gh auth login -h github.com
./scripts/create-github-repos-and-push-services.sh
```

Scaffold templates are generated into `.scaffold-cache/` by `./scripts/generate-service-scaffold.sh` (optional to regenerate).

## Shared library `@ross2p/common`

`libs/common` includes Kafka service names (`Services` enum). Docker builds patch `@ross2p/*` to `file:../libs/*` via [`docker/nest-app.Dockerfile`](docker/nest-app.Dockerfile), so **you do not need to publish to npm** for local Compose builds.

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

From this directory (Docker Desktop running):

```bash
cp .env.example .env   # optional overrides
docker compose up --build
```

- **Kafka UI**: http://localhost:3000  
- **Nginx gateway** (paths `/svc/<service>/…`): http://localhost:80  
- **Services**: host ports `3002`–`3012` map to internal `3000`

## GitHub CLI

`gh` is used to create private repos. Install: `brew install gh`.
