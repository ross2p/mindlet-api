import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, ValidationPipe } from '@ross2p/common';
import { CreateAttemptDto } from './dtos/create-attempt.dto';
import { UpdateAttemptDto } from './dtos/update-attempt.dto';
import { createAttemptSchema } from './schemas/create-attempt.schema';
import { updateAttemptSchema } from './schemas/update-attempt.schema';
import { AttemptEntity } from './attempt.entity';
import { AttemptService } from './attempt.service';

@ApiTags('Attempt')
@ApiBearerAuth()
@Controller('attempt')
@UseGuards(AuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get test attempt by id' })
  @ApiResponse({
    status: 200,
    description: 'Attempt found',
    type: AttemptEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findAttemptById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attemptService.findAttemptByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create test attempt (CRUD stub; no submit flow)' })
  @ApiResponse({
    status: 201,
    description: 'Attempt created',
    type: AttemptEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createAttempt(
    @Body(new ValidationPipe(createAttemptSchema)) dto: CreateAttemptDto,
  ) {
    return this.attemptService.createAttempt(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test attempt' })
  @ApiResponse({
    status: 200,
    description: 'Attempt updated',
    type: AttemptEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateAttempt(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateAttemptSchema)) dto: UpdateAttemptDto,
  ) {
    return this.attemptService.updateAttempt(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete test attempt' })
  @ApiResponse({
    status: 200,
    description: 'Attempt deleted',
    type: AttemptEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteAttempt(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attemptService.deleteAttempt(id);
  }
}
