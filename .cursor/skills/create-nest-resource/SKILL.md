---
name: create-nest-resource
description: Scaffold a complete, scalable NestJS resource (module, controller, service, repository, entity, DTOs, optional mapper/enums) following strict folder, naming and architectural conventions of this project. Use when the user asks to create a new NestJS resource, module, feature, entity, CRUD, or scaffold something like "create resource for Product", "generate NestJS module for X", or mentions creating controller/service/repository for a new entity.
---

# Create NestJS Resource (Module, Controller, Service, Repository)

Generates a complete, scalable NestJS resource block in this project, following strict architectural and naming conventions.

## When to Apply

Trigger this skill when the user asks to:
- Create / scaffold a new NestJS resource, module, or feature.
- Generate controller + service + repository for a new entity.
- Add CRUD endpoints for a new model.

## Inputs to Confirm Before Generating

Before generating files, make sure you have:

1. **Entity name** in PascalCase (e.g. `Product`) and kebab-case (e.g. `product`).
2. **Target app/folder** inside `apps/<app>/src/...` (default to the most relevant existing app based on context, e.g. `apps/user/src/<entity>`).
3. **Whether a mapper is needed** (only if response shape differs from entity, or complex transformations are required).
4. **Whether enums are needed** (only if the entity has typed status/category fields).
5. **Whether the module has submodules** (only then use `RouterModule.register`).

If any of these are unclear and a sensible default is not obvious from context, ask one consolidated clarifying question before generating.

## Folder & File Structure

For an entity `name-entity` (kebab-case) generate, inside a new `name-entity/` folder:

```
name-entity/
├── name-entity.module.ts
├── name-entity.controller.ts
├── name-entity.service.ts
├── name-entity.repository.ts
├── name-entity.entity.ts
├── name-entity.mapper.ts          # only if complex transformations are needed
├── dtos/
│   ├── create-name-entity.dto.ts
│   └── update-name-entity.dto.ts
└── enums/                         # only if applicable
```

If the module grows to have multiple services or controllers, group them into `services/` or `controllers/` subdirectories instead of leaving siblings flat.

## Naming Conventions (apply everywhere)

- Methods in Controllers and Services MUST follow: `[action][EntityName][OptionalDescription]`.
  - Examples: `findUser`, `findUserByIdOrThrow`, `updateUser`, `createUser`, `deleteUser`.
- NEVER use bare generic names like `update`, `delete`, `create`, `findById`. Always append the entity name (e.g. `updateNameEntity`).
- Class names: `NameEntityModule`, `NameEntityController`, `NameEntityService`, `NameEntityRepository`, `NameEntityMapper`.
- File names: kebab-case, suffixed by role (`.module.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`, `.mapper.ts`, `.entity.ts`, `.dto.ts`).
- DTO class names: `CreateNameEntityDto`, `UpdateNameEntityDto`.

## Architectural Rules (must hold)

- **Controller**: NO business logic, NO data manipulation. Only delegates to the service. Must include Swagger decorators.
- **Service**: Holds business logic. MUST NOT execute database queries or external API calls directly — always go through the repository/client.
- **Repository**: Direct DB / external API access only. Minimal logic, just query execution. Uses `DatabaseService` from `@ross2p/database`.
- **Mapper**: Optional. If created, methods MUST NOT be `static` — must be an `@Injectable()` class.
- **DTOs**: Use `@ApiProperty` and `class-validator` decorators. `Update` DTOs should extend `PartialType` from `@nestjs/swagger`.
- **Validation**: Use utility helpers like `checkExists` from `@ross2p/common` (or the project equivalent) for existence checks instead of ad-hoc `if (!x) throw`.

## Templates

Use these as the canonical shape. Replace `NameEntity` / `name-entity` / `nameEntity` consistently.

### 1. Module — `name-entity.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NameEntityController } from './name-entity.controller';
import { NameEntityService } from './name-entity.service';
import { NameEntityRepository } from './name-entity.repository';

@Module({
  controllers: [NameEntityController],
  providers: [NameEntityService, NameEntityRepository],
  exports: [NameEntityService],
})
export class NameEntityModule {}
```

If the module contains submodules, wire them with `RouterModule.register`:

```typescript
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { NameEntityController } from './name-entity.controller';
import { NameEntityService } from './name-entity.service';
import { NameEntityRepository } from './name-entity.repository';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'name-entity',
        module: NameEntityModule,
        children: [
          // child modules go here
        ],
      },
    ]),
  ],
  controllers: [NameEntityController],
  providers: [NameEntityService, NameEntityRepository],
  exports: [NameEntityService],
})
export class NameEntityModule {}
```

### 2. Controller — `name-entity.controller.ts`

CRITICAL: NO business logic. The controller only calls the service. Always include Swagger decorators (`@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse`).

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NameEntityService } from './name-entity.service';
import { CreateNameEntityDto } from './dtos/create-name-entity.dto';
import { UpdateNameEntityDto } from './dtos/update-name-entity.dto';
import { NameEntity } from './name-entity.entity';

@ApiTags('Name Entity')
@ApiBearerAuth()
@Controller('name-entity')
export class NameEntityController {
  constructor(private readonly nameEntityService: NameEntityService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, description: 'Found successfully', type: NameEntity })
  public async findNameEntityById(@Param('id') id: string) {
    return this.nameEntityService.findNameEntityByIdOrThrow(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: 201, description: 'Created successfully', type: NameEntity })
  public async createNameEntity(@Body() dto: CreateNameEntityDto) {
    return this.nameEntityService.createNameEntity(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, description: 'Updated successfully', type: NameEntity })
  public async updateNameEntity(
    @Param('id') id: string,
    @Body() dto: UpdateNameEntityDto,
  ) {
    return this.nameEntityService.updateNameEntity(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  public async deleteNameEntity(@Param('id') id: string) {
    return this.nameEntityService.deleteNameEntity(id);
  }
}
```

### 3. Service — `name-entity.service.ts`

CRITICAL: No direct DB or external API calls. Always inject and use the repository/client. Use `checkExists` for existence validation.

```typescript
import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { NameEntityRepository } from './name-entity.repository';
import { CreateNameEntityDto } from './dtos/create-name-entity.dto';
import { UpdateNameEntityDto } from './dtos/update-name-entity.dto';
import { NameEntity } from './name-entity.entity';

@Injectable()
export class NameEntityService {
  constructor(private readonly nameEntityRepository: NameEntityRepository) {}

  public async findNameEntityByIdOrThrow(id: string): Promise<NameEntity> {
    return await checkExists<NameEntity>(
      this.nameEntityRepository.findNameEntityById(id),
      'NameEntity Not Found',
    );
  }

  public async createNameEntity(data: CreateNameEntityDto): Promise<NameEntity> {
    return this.nameEntityRepository.createNameEntity(data);
  }

  public async updateNameEntity(
    id: string,
    data: UpdateNameEntityDto,
  ): Promise<NameEntity> {
    await this.findNameEntityByIdOrThrow(id);
    return this.nameEntityRepository.updateNameEntity(id, data);
  }

  public async deleteNameEntity(id: string): Promise<NameEntity> {
    await this.findNameEntityByIdOrThrow(id);
    return this.nameEntityRepository.deleteNameEntity(id);
  }
}
```

### 4. Repository — `name-entity.repository.ts`

Direct DB access only. Minimal logic.

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService, Prisma } from '@ross2p/database';
import { CreateNameEntityDto } from './dtos/create-name-entity.dto';
import { UpdateNameEntityDto } from './dtos/update-name-entity.dto';
import { NameEntity } from './name-entity.entity';

@Injectable()
export class NameEntityRepository {
  private readonly nameEntityRepository: Prisma.NameEntityDelegate;

  constructor(databaseService: DatabaseService) {
    this.nameEntityRepository = databaseService.client.nameEntity;
  }

  public async findNameEntityById(id: string): Promise<NameEntity | null> {
    return this.nameEntityRepository.findUnique({
      where: { id },
    });
  }

  public async createNameEntity(data: CreateNameEntityDto): Promise<NameEntity> {
    return this.nameEntityRepository.create({ data });
  }

  public async updateNameEntity(
    id: string,
    data: UpdateNameEntityDto,
  ): Promise<NameEntity> {
    return this.nameEntityRepository.update({
      where: { id },
      data,
    });
  }

  public async deleteNameEntity(id: string): Promise<NameEntity> {
    return this.nameEntityRepository.delete({
      where: { id },
    });
  }
}
```

### 5. Mapper — `name-entity.mapper.ts` (optional)

CRITICAL: methods MUST NOT be `static`. Must be an `@Injectable()` class. If used, register it in the module's `providers`.

```typescript
import { Injectable } from '@nestjs/common';
import { NameEntity } from './name-entity.entity';

@Injectable()
export class NameEntityMapper {
  public toResponseDto(entity: NameEntity) {
    return {
      id: entity.id,
      // mapping logic...
    };
  }
}
```

### 6. DTOs — `dtos/create-name-entity.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNameEntityDto {
  @ApiProperty({ description: 'The name of the entity' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 7. DTOs — `dtos/update-name-entity.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateNameEntityDto } from './create-name-entity.dto';

export class UpdateNameEntityDto extends PartialType(CreateNameEntityDto) {}
```

### 8. Entity — `name-entity.entity.ts`

If the project re-exports a Prisma-based entity from `@ross2p/types`, prefer importing/re-exporting from there. Otherwise scaffold a minimal class with `@ApiProperty` for Swagger:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class NameEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

## Generation Workflow

Follow this checklist on every invocation:

```
- [ ] Confirm entity name (PascalCase + kebab-case) and target app path
- [ ] Decide: mapper needed? enums needed? submodules?
- [ ] Create the `name-entity/` folder with the files listed above
- [ ] Apply naming conventions to ALL methods ([action][EntityName][...])
- [ ] Ensure controller has zero business logic and full Swagger decorators
- [ ] Ensure service has zero direct DB calls and uses `checkExists` for existence
- [ ] Ensure repository only contains query execution
- [ ] If a mapper exists, ensure it is `@Injectable()` and has NO static methods
- [ ] Register the new module in its parent module's `imports`
- [ ] Run linter / formatter on generated files
```

## Anti-Patterns to Reject

- Business logic in controllers (mapping, validation branching, conditionals beyond delegation).
- Direct `databaseService.client.*` or `prisma.*` calls inside services.
- Generic method names like `update(id, dto)`, `delete(id)`, `findOne(id)` on services or controllers.
- `static` methods on mappers.
- Update DTOs that duplicate fields instead of extending `PartialType(CreateXDto)`.
- Missing `@ApiOperation` / `@ApiResponse` on controller routes.
- Forgetting to add the new module to its parent module's `imports`.

## Example — User Module (reference shape in this codebase)

The existing `apps/user/src/user/` module already follows these conventions and is the canonical reference:

- `user.repository.ts` — uses `DatabaseService` from `@ross2p/database`, `Prisma.UserDelegate`, methods like `findUserById`, `createUser`, `updateUser`, `deleteUser`.
- `user.service.ts` — injects `UserRepository`, uses `checkExists` from `@ross2p/common`, methods `findUserByIdOrThrow`, `findUserByEmailOrThrow`, `createUser`, `updateUser`, `deleteUser`.
- `user.controller.ts` — only delegates to the service.

When generating a new resource, mirror this shape exactly, only renaming the entity.
