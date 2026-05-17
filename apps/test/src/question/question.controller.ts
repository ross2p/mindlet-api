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
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { createQuestionSchema } from './schemas/create-question.schema';
import { updateQuestionSchema } from './schemas/update-question.schema';
import { QuestionEntity } from './question.entity';
import { QuestionService } from './question.service';

@ApiTags('Question')
@ApiBearerAuth()
@Controller('question')
@UseGuards(AuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get question by id' })
  @ApiResponse({
    status: 200,
    description: 'Question found',
    type: QuestionEntity,
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findQuestionById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questionService.findQuestionByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create question under a test' })
  @ApiResponse({
    status: 201,
    description: 'Question created',
    type: QuestionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createQuestion(
    @Body(new ValidationPipe(createQuestionSchema)) dto: CreateQuestionDto,
  ) {
    return this.questionService.createQuestion(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update question' })
  @ApiResponse({
    status: 200,
    description: 'Question updated',
    type: QuestionEntity,
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateQuestion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateQuestionSchema)) dto: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({
    status: 200,
    description: 'Question deleted',
    type: QuestionEntity,
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteQuestion(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questionService.deleteQuestion(id);
  }
}
