# Mindlet event conventions (Kafka)

Kafka is a **shared platform component**. Services remain independent by **strict topic and schema contracts**, not by running separate clusters per service (unless a dedicated platform overlay is added later).

## Topic naming

Format:

```text
<domain>.<entity>.<action>.v<major>
```

Rules:

- **domain**: Usually the owning service short name (`auth`, `user`, `course`, …). Use lowercase ASCII.
- **entity**: Noun in singular or plural, consistent per domain (`session`, `user`, `lesson`, …).
- **action**: Past tense or noun form (`created`, `updated`, `revoked`, `published`).
- **v\<major\>**: Major version suffix. **Immutable**: once published, the payload shape for that major version must not break consumers.

Examples:

- `auth.session.created.v1`
- `user.profile.updated.v1`
- `course.enrollment.completed.v2`

## Versioning and compatibility

- **Additive** changes (new optional fields) within the same major version are allowed if all consumers tolerate unknown fields.
- **Breaking** changes require a **new major topic suffix** (e.g. `.v2`) or a new topic name; keep publishing the old version until all consumers migrate (deprecation window).
- Document producers and consumers in `contracts/events.asyncapi.yaml` in each repo.

## Payloads

- Prefer **JSON** with explicit content type and documented schema (AsyncAPI, JSON Schema, or protobuf with Schema Registry when adopted).
- Include correlation identifiers when available (`correlationId`, `traceparent`).

## Consumer groups

- Pattern: `mindlet.<service>.<purpose>` (e.g. `mindlet.notification.dispatcher`). Avoid reusing the same group across unrelated flows.

## Platform broker env

- Services read `KAFKA_BROKER` from platform ConfigMap (e.g. `kafka:9092` in-namespace). Do not assume host ports from Docker Compose in application code; use env everywhere.
