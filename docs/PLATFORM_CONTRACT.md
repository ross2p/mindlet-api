# Mindlet platform contract (meta-repo ↔ service repos)

This document defines the interface between **mindlet-api** (platform meta-repo) and each **mindlet-\<service\>** repository. Any service implementation (Node, Java, Go, …) must satisfy this contract to run on the cluster.

## Namespace and discovery

- All workloads run in namespace `mindlet` unless a future overlay says otherwise.
- In-cluster DNS: `\<service-name\>.mindlet.svc.cluster.local` for Kubernetes `Service` objects.
- Kafka (shared event bus): broker address is provided as `KAFKA_BROKER` in the `platform-config` ConfigMap (same namespace). Services must not hardcode broker hostnames in code; read from env.

## Container runtime

- **Protocol**: HTTP on a single container port (default **3000**). Declare the port in the Service manifest.
- **Process**: Stateless; no required local disk beyond ephemeral `/tmp` unless documented.
- **Signals**: Handle **SIGTERM** for graceful shutdown (close DB pools, drain Kafka consumers within `terminationGracePeriodSeconds`, default 30s).

## Health endpoints (required)

| Endpoint   | Purpose |
|-----------|---------|
| `GET /livez`  | Process is up (event loop / JVM running). Must return **200** quickly. |
| `GET /readyz` | Ready for traffic: dependencies the service needs for normal requests (e.g. DB, Kafka client) are reachable. Return **200** when ready, **503** when not. |

Until implemented, services may temporarily use TCP probes only in **dev** overlays; production overlays must use HTTP probes per this contract.

## Configuration

- **Platform env** (injected via `envFrom` → `platform-config` ConfigMap): shared non-secret keys only, e.g. `KAFKA_BROKER`, `LOG_FORMAT`, optional `OTEL_EXPORTER_OTLP_ENDPOINT`, `SENTRY_ENV`.
- **Service env** (ConfigMap + Secret owned by the service repo): `SERVICE_NAME`, `DATABASE_URL`, `REDIS_URL`, `MONGODB_URI`, API keys, etc. No shared Secret across services for DB credentials.

## Data ownership

- Each service owns its **PostgreSQL** and/or **Redis** and/or **MongoDB** instances declared in its own `deploy/` manifests. No shared database instances between services on the platform default path.
- **Kafka** is intentionally shared; isolation is by **topic naming and schemas** (see [EVENT_CONVENTIONS.md](./EVENT_CONVENTIONS.md)).

## Networking (Kubernetes)

- Services expose a `ClusterIP` Service for app traffic.
- **Ingress**: Each service ships an `Ingress` rule for the public path `/svc/\<name\>/` (same behaviour as the former nginx gateway). Optional: internal-only services may omit Ingress.
- **NetworkPolicy**: Workloads that set label `mindlet.io/network-policy: default-deny-ingress` are protected by a platform NetworkPolicy until their own policy allows ingress (e.g. from `ingress-nginx`).

## Contracts directory (required in each service repo)

Under the service repository root:

- `contracts/events.asyncapi.yaml` — topics this service **publishes** and **consumes** (may be minimal stubs initially).
- `contracts/rest.openapi.yaml` — HTTP API surface exposed at `/svc/\<name\>/` (may reference generated spec later).

## Observability (recommended from day one)

- Structured logs (JSON) with `service`, `traceId` when tracing is enabled.
- OpenTelemetry-compatible export if `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## Build and image naming (local / CI)

- Image name convention: `mindlet-\<service\>:\<tag\>` (e.g. `mindlet-auth:dev`).
- Docker Compose builds each service from `apps/\<service\>/` using that repo’s `Dockerfile` (`npm ci` + `npm run build` in the service directory).

## Compliance checklist (service team)

- [ ] HTTP server on declared port  
- [ ] `/livez` and `/readyz` (or documented exception for dev only)  
- [ ] No secrets in ConfigMap; use Secret  
- [ ] `contracts/` present and updated when public API or events change  
- [ ] Topic names follow [EVENT_CONVENTIONS.md](./EVENT_CONVENTIONS.md)  
