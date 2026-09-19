# mindlet-api conventions

These conventions were previously enforced by Cursor rules (`.cursor/rules/*.mdc`, auto-attached
by glob). Claude Code has no glob-scoped rule attachment, so they're consolidated here as
always-loaded project instructions. The file glob each section used to trigger on is noted per
section so the scope stays clear.

## Entity and repository conventions

_Applies to: `apps/**/*.entity.ts`, `apps/**/*.repository.ts`_

### 1. Entity implements the ORM row type

Domain entity classes used as API / service shapes should **implement** the generated model type
so schema drift breaks compile-time.

**Prisma (v7 `prisma-client` generator, output e.g. `generated/client`)**

```typescript
import type { Team } from '../../generated/client/client';

export class TeamEntity implements Team {
  // @ApiProperty… + fields matching Team
}
```

**Drizzle (example)**

```typescript
import type { InferSelectModel } from 'drizzle-orm';
import { teams } from './schema';

export class TeamEntity implements InferSelectModel<typeof teams> {}
```

**Forbidden**: a free-standing entity with hand-listed fields that is not tied to `implements` /
`InferSelectModel` when the source of truth is the ORM.

### 2. No `toEntity(row)` in repositories

If the entity `implements` the Prisma `Team` (or equivalent), the `findUnique` / `create` /
`update` / `delete` result **is already** a `TeamEntity`-compatible object. Do not map
field-by-field.

```typescript
// BAD
private toEntity(row: Team): TeamEntity {
  return { id: row.id, name: row.name, /* … */ };
}
return row ? this.toEntity(row) : null;

// GOOD
return this.db.team.findUnique({ where: { id } });
```

### 3. Finders: prefer direct return; name locals by domain

Avoid `const row = await …` unless you need branching. Prefer
`return await this.db.team.findUnique(…)`.

If you need a local variable, use **`team`**, not `row`.

```typescript
// GOOD
public findTeamById(id: string): Promise<TeamEntity | null> {
  return this.db.team.findUnique({ where: { id } });
}
```

### 4. `create`: do not duplicate DB defaults in code

Do not write `field: dto.field ?? null` or `isPublic: dto.isPublic ?? false` when the database
already defines defaults (`@default`, optional columns → `NULL`).

Put defaults in **`schema.prisma`** (or Drizzle schema), not in the repository.

```typescript
// BAD
await this.db.team.create({
  data: {
    name: data.name,
    description: data.description ?? null,
    isPublic: data.isPublic ?? false,
  },
});

// GOOD
await this.db.team.create({ data });
```

Pair with the Prisma partial-update rule below for semantics of `null` vs `undefined`.

### 5. `update`: do not rebuild `data` with per-field `undefined` checks

Prisma treats **`undefined`** as "skip column" and **`null`** as "set NULL". A validated
`UpdateTeamDto` from `PartialType` already carries the right shape — pass it through.

```typescript
// BAD
const updateData: Prisma.TeamUpdateInput = {};
if (data.name !== undefined) updateData.name = data.name;
// …

// GOOD
return this.db.team.update({ where: { id }, data });
```

### 6. No empty-update fallback branches

Do not add guards like `if (Object.keys(data).length === 0) return findUniqueOrThrow(…)` before
`update`. Prisma handles empty `data` without extra repository logic.

Pairs with "No business logic in repositories" and "Repository-only data access" below.

## Prisma partial updates

_Applies to: `**/*.ts`_

When building `data` for `prisma.*.update` / `updateMany`:

- Use **one object** with the fields you intend to change; do **not** use conditional spreads like
  `...(x != null ? { field: x } : {})` to skip keys.
- If the business rule is "set column to NULL", the value in the DTO/patch must be **`null`** so
  Prisma receives `null` and persists it.
- If the business rule is "leave column unchanged", the property must be **`undefined`** (omit the
  key or assign `undefined`) so Prisma does not touch that column.

This keeps "clear field" vs "ignore field" unambiguous and avoids noisy spread chains.

## No business logic in repositories

_Applies to: `apps/**/*.repository.ts`_

A `*.repository.ts` file must **only** translate between your domain DTOs / Prisma types and the
database (or cache key/value shapes). It must **not** encode business rules.

### Forbidden in repositories

- Deciding *when* to revoke vs update, or *who* may access a row (ownership checks).
- Calling `checkExists` / throwing HTTP exceptions for "not found" — do that in **services**.
- Hashing secrets, computing TTLs from business rules, emitting domain events, or calling other
  services.
- `if (userId !== row.userId) throw …` — belongs in a **service**.

### Allowed in repositories

- `findUnique`, `findMany`, `create`, `update`, `updateMany`, `delete` (and equivalent cache
  `get`/`set`/`del`).
- Building plain `Prisma.*Input` objects **from arguments already prepared** by the service (no
  extra policy).

### Correct split

```typescript
// session.repository.ts — OK
async updateSession(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
  return this.db.session.update({ where: { id }, data });
}

// session.service.ts — OK (policy + checkExists + side effects)
async signOut(userId: string, sessionId: string): Promise<void> {
  const row = await checkExists(this.sessionRepository.findSessionById(sessionId), 'Session not found');
  if (row.userId !== userId) throw new ForbiddenException();
  await this.sessionRepository.updateSession(sessionId, { revokedAt: new Date(), revokedReason: 'sign-out' });
  await this.sessionCache.markRevoked(sessionId);
}
```

## Repository-only data access

_Applies to: `apps/**/*.service.ts`_

`DatabaseService`, `CacheService`, `PrismaClient`, and `ioredis` (Redis) must **never** be imported
or injected directly into a `*.service.ts` file.

- **Allowed** in `*.repository.ts` and `*.module.ts` files.
- **Forbidden** in `*.service.ts`, `*.controller.ts`, or any other file.

Services contain business logic; repositories contain data-access logic. Mixing them creates
untestable, tightly coupled code.

```typescript
// session.repository.ts — OK
@Injectable()
export class SessionRepository {
  constructor(private readonly db: DatabaseService) {}
}

// session.service.ts — OK (injects the repository, not the DB directly)
@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}
}
```

```typescript
// session.service.ts — FORBIDDEN
@Injectable()
export class SessionService {
  constructor(private readonly db: DatabaseService) {} // ← violation
}
```

## `@ResponseMessage` on every HTTP endpoint

_Applies to: `apps/**/*.controller.ts`_

Every HTTP route handler (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`) **must** be decorated with
`@ResponseMessage('…')` from `@ross2p/common`.

The `ResponseInterceptor` in `CommonModule` reads this metadata and includes a human-readable
`message` field in the `SuccessResponse<T>` envelope.

```typescript
import { ResponseMessage } from '@ross2p/common';

@Controller('session')
export class SessionController {
  @Post('sign-out')
  @ResponseMessage('Signed out successfully')
  async signOut(...) { ... }

  @Get()
  @ResponseMessage('Sessions retrieved')
  async listSessions(...) { ... }
}
```

```typescript
// Incorrect — missing @ResponseMessage
@Controller('session')
export class SessionController {
  @Post('sign-out')
  async signOut(...) { ... }
}
```

`@ResponseMessage` is defined in `libs/common/src/decorators/response-message.decorator.ts` and
exported from `@ross2p/common`.

## No cross-module repository injection in services

_Applies to: `apps/**/*.service.ts`_

A `*.service.ts` file must **not** import or inject a `*.repository.ts` that lives under a
**different** feature folder than the service.

- **Allowed**: inject repositories whose files sit next to the service (same feature folder), e.g.
  `session/session.service.ts` → `session/session.repository.ts`.
- **Allowed**: inject other modules' **services** (e.g. `credentials/credentials.service.ts` →
  `two-factor/two-factor.service.ts`).
- **Forbidden**: `credentials/credentials.service.ts` injecting `two-factor/two-factor.repository.ts`
  (or any repository from another feature folder).

Repositories are an internal persistence boundary of a feature. Another feature should depend on
the **public API** of that feature (its service), not on how data is stored.

```typescript
// credentials.service.ts — OK
constructor(
  private readonly twoFactorService: TwoFactorService,
) {}
```

```typescript
// two-factor/two-factor.service.ts — OK
constructor(
  private readonly twoFactorRepository: TwoFactorRepository,
) {}
```

## Use `@ross2p/common` helpers

_Applies to: `apps/**/*.controller.ts`, `apps/**/*.service.ts`, `apps/**/*.repository.ts`_

`@ross2p/common` provides a set of primitives that must be used instead of custom
re-implementations.

### `@ClientInfo()` — IP and User-Agent extraction

**Never** access `req.ip` or `req.headers['user-agent']` directly in controllers.

```typescript
// CORRECT
import { ClientInfo, ClientInfoType } from '@ross2p/common';

@Post('login')
login(@Body() dto: LoginDto, @ClientInfo() info: ClientInfoType) {
  return this.service.login({ ...dto, ipAddress: info.ip, userAgent: info.userAgent });
}

// FORBIDDEN
login(@Req() req: Request) {
  const ip = req.ip;             // ← use @ClientInfo() instead
  const ua = req.headers['user-agent']; // ← use @ClientInfo() instead
}
```

### `@IsPublic()` — public route bypass

Mark routes that should not require authentication with `@IsPublic()` so `AuthGuard` skips them.

```typescript
import { IsPublic } from '@ross2p/common';

@Post('login')
@IsPublic()
login(@Body() dto: LoginDto) { ... }
```

### `@DataPayload()` — Kafka message data extraction

Every `@MessagePattern` handler must use `@DataPayload(new ValidationPipe(schema))` instead of
`@Payload()`.

```typescript
import { AuthMessage, DataPayload, ValidationPipe } from '@ross2p/common';

@MessagePattern(AuthMessage.USER_VALIDATE)
validate(@DataPayload(new ValidationPipe(accessTokenSchema)) dto: AccessTokenDto) { ... }
```

### `checkExists()` — null-safety from repositories

Replace manual null checks in repositories and services with `checkExists`.

```typescript
import { checkExists } from '@ross2p/common';

// CORRECT
const session = await checkExists(
  this.db.session.findUnique({ where: { id } }),
  'Session not found',
);

// FORBIDDEN
const session = await this.db.session.findUnique({ where: { id } });
if (!session) throw new NotFoundException('Session not found'); // ← use checkExists
```

### `Services` enum + `ClientModule.register`

**Never** hardcode Kafka service tokens as strings.

```typescript
// CORRECT
ClientModule.register(Services.USER, Services.NOTIFICATION)
@Inject(Services.USER) private readonly userService: ClientService

// FORBIDDEN
ClientModule.register('USER_SERVICE')   // ← use Services.USER
@Inject('USER_SERVICE') ...             // ← use Services.USER
```

### `ClientService` — no `asKafkaClient`

`ClientService` already exposes `subscribeToResponseOf`, `connect`, and `emitEvent` directly.
Never cast to `ClientKafka` or use `asKafkaClient`.

```typescript
// CORRECT
await this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
await this.userService.connect();
this.userService.emitEvent(AuthEvent.SESSION_STARTED, payload);

// FORBIDDEN
asKafkaClient(this.userService).connect(); // ← asKafkaClient is banned
(this.userService as ClientKafka).connect(); // ← raw cast is banned
```
