# Mindlet deployment (Kubernetes + local Compose)

This meta-repo (`mindlet-api`) hosts **platform** manifests under [`infra/platform/`](../infra/platform/) and orchestration scripts under [`scripts/`](../scripts/). Each microservice under `apps/<name>/` is typically a **git submodule** with its own GitHub repo; Kubernetes manifests and Compose fragments for that service live **next to the app** (`apps/<name>/deploy/`, `apps/<name>/compose.yaml`).

## Prerequisites

- Docker (for images + optional Compose)
- [`kind`](https://kind.sigs.k8s.io/) and `kubectl`
- Optional: `kustomize` (or use `kubectl apply -k`)

Read the platform ↔ service contract: [`PLATFORM_CONTRACT.md`](./PLATFORM_CONTRACT.md) and event naming: [`EVENT_CONVENTIONS.md`](./EVENT_CONVENTIONS.md).

## Regenerate manifests

When you change service metadata, ports, or dependencies, run from repo root:

```bash
node tools/render-service-deploys.cjs
```

This refreshes `apps/*/deploy/**`, `apps/*/compose.yaml`, root `docker-compose.yml`, and `infra/platform/compose.yaml`.

## Local Kubernetes (kind)

### 1. Bootstrap cluster + ingress

```bash
bash scripts/bootstrap-cluster.sh
```

This creates a kind cluster (default name `mindlet`) and installs **ingress-nginx** using the upstream kind manifest. See [`infra/platform/ingress-nginx/README.md`](../infra/platform/ingress-nginx/README.md).

Map hostnames that resolve to `127.0.0.1` (e.g. [localtest.me](https://readme.localtest.me/)):

- `mindlet.localtest.me` — service Ingress rules (`/svc/<service>/…`)
- `kafka-ui.localtest.me` — Kafka UI (platform Ingress)

### 2. Build images and load into kind

```bash
export KIND_CLUSTER_NAME=mindlet   # default
bash scripts/build-images.sh dev
```

### 3. Apply platform (namespace, Kafka, UI, config)

```bash
bash scripts/deploy-platform.sh
```

### 4. Apply all service overlays (dev)

```bash
bash scripts/deploy-services.sh dev
```

Or both:

```bash
bash scripts/deploy-all.sh dev
```

### 5. Smoke test

```bash
kubectl get pods -n mindlet
curl -sS -o /dev/null -w "%{http_code}" http://mindlet.localtest.me/svc/auth/
```

## Local Docker Compose (no Kubernetes)

```bash
docker compose up --build
```

Uses merged `include:` files; each app brings its own database containers where needed.

## GitOps (future)

An example **Argo CD ApplicationSet** is at [`infra/platform/argocd/applicationset.yaml.example`](../infra/platform/argocd/applicationset.yaml.example). It is **not** applied by default.

## Submodule workflow

After merging deploy changes in a service repository, bump the submodule pointer in this meta-repo:

```bash
git submodule update --remote apps/<name>
git add apps/<name>
git commit -m "chore: bump <name> submodule"
```

If `git submodule update --remote` fails (for example `Unable to find refs/remotes/origin/HEAD` in a submodule), configure the default branch in that remote repository or run:

```bash
git -C apps/<name> fetch origin && git -C apps/<name> pull --ff-only origin <branch>
```

## Secrets

Dev manifests ship **placeholder** `Secret` data for local clusters only. For real environments use Sealed Secrets, External Secrets, or your cloud secret manager — not committed plain text.
