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
import { CreateAnswerOptionDto } from './dtos/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './dtos/update-answer-option.dto';
import { createAnswerOptionSchema } from './schemas/create-answer-option.schema';
import { updateAnswerOptionSchema } from './schemas/update-answer-option.schema';
import { AnswerOptionEntity } from './answer-option.entity';
import { AnswerOptionService } from './answer-option.service';

@ApiTags('Answer Option')
@ApiBearerAuth()
@Controller('answer-option')
@UseGuards(AuthGuard)
export class AnswerOptionController {
  constructor(private readonly answerOptionService: AnswerOptionService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get answer option by id' })
  @ApiResponse({
    status: 200,
    description: 'Answer option found',
    type: AnswerOptionEntity,
  })
  @ApiResponse({ status: 404, description: 'Answer option not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findAnswerOptionById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.answerOptionService.findAnswerOptionByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create answer option for a question' })
  @ApiResponse({
    status: 201,
    description: 'Answer option created',
    type: AnswerOptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createAnswerOption(
    @Body(new ValidationPipe(createAnswerOptionSchema))
    dto: CreateAnswerOptionDto,
  ) {
    return this.answerOptionService.createAnswerOption(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update answer option' })
  @ApiResponse({
    status: 200,
    description: 'Answer option updated',
    type: AnswerOptionEntity,
  })
  @ApiResponse({ status: 404, description: 'Answer option not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateAnswerOption(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateAnswerOptionSchema))
    dto: UpdateAnswerOptionDto,
  ) {
    return this.answerOptionService.updateAnswerOption(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete answer option' })
  @ApiResponse({
    status: 200,
    description: 'Answer option deleted',
    type: AnswerOptionEntity,
  })
  @ApiResponse({ status: 404, description: 'Answer option not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteAnswerOption(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.answerOptionService.deleteAnswerOption(id);
  }
}
