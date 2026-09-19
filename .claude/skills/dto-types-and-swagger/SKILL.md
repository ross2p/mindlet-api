---
name: dto-types-and-swagger
description: Rules for creating new TypeScript interfaces, classes, types, entities, and DTOs in the mindlet-api codebase, plus Swagger (`@nestjs/swagger`) annotation conventions for request/response DTOs. Use whenever adding or modifying an `interface`, `class`, `type` alias, `*.dto.ts`, `*.entity.ts`, or `*.type.ts` file, or when touching `@ApiProperty` / `@ApiPropertyOptional` decorators.
---

# DTO / Type Placement and Swagger Conventions

Two hard rules govern every new type in this repo:

1. **Where it lives** — types are forbidden inside service/repository/controller files.
2. **How it's documented** — request/response DTOs require Swagger annotations following the patterns below.

---

## Rule 1 — Type placement (STRICT, no exceptions)

> Ні в якому випадку не можна створювати типи, інтерфейси, класи у файлах сервісів, репозиторіїв, контролерів. Це заборонено.

Forbidden — never declare a `class`, `interface`, `type`, or `enum` inside any of these files:

- `**/*.service.ts`
- `**/*.repository.ts`
- `**/*.controller.ts`
- `**/*.module.ts`
- `**/*.guard.ts`, `**/*.strategy.ts`, `**/*.interceptor.ts`, `**/*.pipe.ts`, `**/*.mapper.ts`

This includes "tiny helper" shapes, return-type aliases, and locally-scoped interfaces. They all belong in a dedicated type file.

### Where types must live

All shared/domain types live under `libs/types/src/types/<domain>/`, one declaration per file, with the existing naming convention:

| Suffix              | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `*.dto.ts`          | Request or response payloads (HTTP boundary)                 |
| `*.entity.ts`       | Domain entity that mirrors a Prisma model                    |
| `*.type.ts`         | Plain interface / type alias used internally                 |
| `*-<verb>.dto.ts`   | Action-specific DTOs (`create-user.dto.ts`, `login.dto.ts`)  |
| `*.enum.ts`         | Enum declarations                                            |

After creating the file, export it from the domain `index.ts` (and ensure the domain is re-exported from `libs/types/src/types/index.ts`).

### Decision flow

1. About to declare a `class` / `interface` / `type` / `enum`?
2. Pick the matching domain folder under `libs/types/src/types/` (or create one).
3. Create a new file using the suffix table above — one declaration per file.
4. Export it from that domain's `index.ts`.
5. Import it from the service/repository/controller — never inline it there.

---

## Rule 2 — Swagger annotations for request/response DTOs

If a DTO (or any nested object inside it) participates in an HTTP **request** or **response**, every property must carry a Swagger decorator. Nested object types must follow the same rules recursively.

### Choosing the decorator

| Situation                                  | Decorator                                                |
| ------------------------------------------ | -------------------------------------------------------- |
| Value can be `undefined` (optional field)  | `@ApiPropertyOptional({ ... })`                          |
| Value can be `null`                        | Add `nullable: true` to the options                      |
| Anything else (always present, non-null)   | `@ApiProperty({ ... })`                                  |

`ApiPropertyOptional` and `nullable: true` are independent and combine freely (e.g. `string | null | undefined` → `@ApiPropertyOptional({ nullable: true, ... })`).

### Description is mandatory

> До всіх анотацій треба добавляти опис.

Every `@ApiProperty` / `@ApiPropertyOptional` MUST include a `description`. No exceptions, even for "obvious" fields like `id` or `createdAt`.

### Type-specific rules

#### Dates and UUIDs — use `format`, never `example`

```ts
@ApiProperty({ description: 'Unique identifier for the user', format: 'uuid' })
id: string;

@ApiProperty({
  description: 'Date and time when the user was created',
  type: String,
  format: 'date-time',
})
createdAt: Date;
```

- UUID → `format: 'uuid'`
- Email → `format: 'email'`
- URL → `format: 'uri'`
- Date / DateTime → `type: String, format: 'date-time'` (or `format: 'date'`)
- Do NOT add `example` for these.

#### Numbers — `example` only when meaningful

Add `example` only if the value is special or constrained to a specific value (e.g. version `1`, fixed quota `100`, page size default). For ordinary numbers, omit `example` and rely on `description` plus validation decorators.

```ts
@ApiProperty({ description: 'API contract version', example: 1 })
version: number;

@ApiProperty({ description: 'Number of items returned per page' })
pageSize: number;
```

#### Enums — always pass `enum`

```ts
@ApiProperty({
  description: 'Authentication provider used to create the session',
  enum: SessionProvider,
})
provider: SessionProvider;
```

This lets clients see exactly which values are accepted. Do not also pass `example` — `enum` is the source of truth.

#### Object / nested DTO fields

Nested objects must explicitly declare their type, and the inner class must itself follow every Swagger rule above.

```ts
@ApiProperty({ description: 'Authenticated user payload', type: UserEntity })
user: UserEntity;
```

For circular or forward references use `type: () => UserEntity`.

For arrays of objects: `@ApiProperty({ description: '...', type: [UserEntity] })`.

#### Strings — when to use `example`

Use `example` for free-form strings where it clarifies the shape (`firstName`, `username`, `phoneNumber`). Skip `example` when `format` already covers it (uuid, email, date-time).

---

## Quick reference template

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SomeEnum } from './some.enum';
import { NestedEntity } from '../nested/nested.entity';

export class ExampleDto {
  @ApiProperty({ description: 'Unique identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User email address', format: 'email' })
  email: string;

  @ApiProperty({ description: 'Display name shown on profile', example: 'John D.' })
  displayName: string;

  @ApiPropertyOptional({ description: 'Profile bio', nullable: true })
  bio: string | null;

  @ApiProperty({ description: 'Account state', enum: SomeEnum })
  status: SomeEnum;

  @ApiProperty({ description: 'Default page size', example: 20 })
  pageSize: number;

  @ApiProperty({ description: 'Owner of the record', type: NestedEntity })
  owner: NestedEntity;

  @ApiProperty({
    description: 'Date and time when the record was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
```

---

## Pre-commit checklist

Before finishing the change, verify:

- [ ] No `class` / `interface` / `type` / `enum` was declared in a service, repository, controller, module, guard, strategy, interceptor, pipe, or mapper file.
- [ ] New types live under `libs/types/src/types/<domain>/` with the correct suffix and are exported from the domain `index.ts`.
- [ ] Every property of every request/response DTO (and every nested DTO) has a Swagger decorator.
- [ ] Every Swagger decorator has a `description`.
- [ ] Optional (`undefined`) fields use `@ApiPropertyOptional`.
- [ ] Nullable (`null`) fields pass `nullable: true`.
- [ ] Dates and UUIDs use `format`, not `example`.
- [ ] Numbers use `example` only when the value is special/constrained.
- [ ] Enums pass `enum: <EnumName>` instead of `example`.
- [ ] Nested object fields pass `type: NestedClass` (or `type: () => NestedClass`) and the nested class itself follows these rules.
