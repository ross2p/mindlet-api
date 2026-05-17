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
import { CreateCorrectTextAnswerDto } from './dtos/create-correct-text-answer.dto';
import { UpdateCorrectTextAnswerDto } from './dtos/update-correct-text-answer.dto';
import { createCorrectTextAnswerSchema } from './schemas/create-correct-text-answer.schema';
import { updateCorrectTextAnswerSchema } from './schemas/update-correct-text-answer.schema';
import { CorrectTextAnswerEntity } from './correct-text-answer.entity';
import { CorrectTextAnswerService } from './correct-text-answer.service';

@ApiTags('Correct Text Answer')
@ApiBearerAuth()
@Controller('correct-text-answer')
@UseGuards(AuthGuard)
export class CorrectTextAnswerController {
  constructor(
    private readonly correctTextAnswerService: CorrectTextAnswerService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get correct text answer by id' })
  @ApiResponse({
    status: 200,
    description: 'Correct text answer found',
    type: CorrectTextAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Correct text answer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findCorrectTextAnswerById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.correctTextAnswerService.findCorrectTextAnswerByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create canonical text answer for a question' })
  @ApiResponse({
    status: 201,
    description: 'Correct text answer created',
    type: CorrectTextAnswerEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createCorrectTextAnswer(
    @Body(new ValidationPipe(createCorrectTextAnswerSchema))
    dto: CreateCorrectTextAnswerDto,
  ) {
    return this.correctTextAnswerService.createCorrectTextAnswer(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update correct text answer' })
  @ApiResponse({
    status: 200,
    description: 'Correct text answer updated',
    type: CorrectTextAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Correct text answer not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateCorrectTextAnswer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateCorrectTextAnswerSchema))
    dto: UpdateCorrectTextAnswerDto,
  ) {
    return this.correctTextAnswerService.updateCorrectTextAnswer(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete correct text answer' })
  @ApiResponse({
    status: 200,
    description: 'Correct text answer deleted',
    type: CorrectTextAnswerEntity,
  })
  @ApiResponse({ status: 404, description: 'Correct text answer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteCorrectTextAnswer(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.correctTextAnswerService.deleteCorrectTextAnswer(id);
  }
}
