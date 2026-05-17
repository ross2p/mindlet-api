# Test service

> Короткий опис відповідальності — 1–2 речення. **TODO**

**Status:** TODO (implemented / partial / scaffolded / planned)

## Current implementation notes

- Prisma models: `Test`, `Question`, `AnswerOption`, `CorrectTextAnswer`, `Attempt`, `AttemptAnswer` (see `prisma/schema.prisma`).
- HTTP CRUD exists per resource (`/test`, `/question`, `/answer-option`, `/correct-text-answer`, `/attempt`, `/attempt-answer`).
- **Not implemented yet:** submit flow, auto/manual scoring (`q_score`, `final_score`, `passed`), time-limit enforcement, Kafka `test.attempt.*` events — see `AttemptService` TODO and `17-grading.md`.

## Documentation map

| Topic | File |
|-------|------|
| Entities & ER diagram | [docs/entities.md](docs/entities.md) |
| Product requirements | [docs/product-requirements.md](docs/product-requirements.md) |
| Business logic | [docs/business-logic.md](docs/business-logic.md) |
| HTTP API | [docs/api.md](docs/api.md) |
| Kafka messaging | [docs/messaging.md](docs/messaging.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |
| Datastores | [docs/datastores.md](docs/datastores.md) |
| Dependencies | [docs/dependencies.md](docs/dependencies.md) |
| Configuration | [docs/configuration.md](docs/configuration.md) |

## Canonical references

- Cross-service catalog: `mindlet-api/docs/services.md` (file not added yet; TBD per [services architecture plan](../../../.cursor/plans/services_architecture_doc_608f37a2.plan.md))
- Domain model: [../../../docs/02-domain-model.md](../../../docs/02-domain-model.md)
- Roles & permissions: [../../../docs/03-roles-and-permissions.md](../../../docs/03-roles-and-permissions.md)
- Kafka events catalog: [../../docs/kafka-events.md](../../docs/kafka-events.md)
- Product feature(s):

- [07-tests-and-decks.md](../../../docs/features/07-tests-and-decks.md)
- [17-grading.md](../../../docs/features/17-grading.md)
