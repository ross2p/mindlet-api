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
import { CreateAttemptAnswerDto } from './dtos/create-attempt-answer.dto';
import { UpdateAttemptAnswerDto } from './dtos/update-attempt-answer.dto';
import { createAttemptAnswerSchema } from './schemas/create-attempt-answer.schema';
import { updateAttemptAnswerSchema } from './schemas/update-attempt-answer.schema';
import { AttemptAnswerEntity } from './attempt-answer.entity';
import { AttemptAnswerService } from './attempt-answer.service';

@ApiTags('Attempt Answer')
@ApiBearerAuth()
@Controller('attempt-answer')
@UseGuards(AuthGuard)
export class AttemptAnswerController {
  constructor(private readonly attemptAnswerService: AttemptAnswerService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt answer by id' })
  @ApiResponse({
    status: 200,
    description: 'Attempt answer found',
    type: AttemptAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt answer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findAttemptAnswerById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attemptAnswerService.findAttemptAnswerByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create attempt answer row' })
  @ApiResponse({
    status: 201,
    description: 'Attempt answer created',
    type: AttemptAnswerEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createAttemptAnswer(
    @Body(new ValidationPipe(createAttemptAnswerSchema))
    dto: CreateAttemptAnswerDto,
  ) {
    return this.attemptAnswerService.createAttemptAnswer(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attempt answer row' })
  @ApiResponse({
    status: 200,
    description: 'Attempt answer updated',
    type: AttemptAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt answer not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateAttemptAnswer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateAttemptAnswerSchema))
    dto: UpdateAttemptAnswerDto,
  ) {
    return this.attemptAnswerService.updateAttemptAnswer(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attempt answer row' })
  @ApiResponse({
    status: 200,
    description: 'Attempt answer deleted',
    type: AttemptAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Attempt answer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteAttemptAnswer(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attemptAnswerService.deleteAttemptAnswer(id);
  }
}
