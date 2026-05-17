import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { QuestionEntity } from './question.entity';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  public async findQuestionByIdOrThrow(
    questionId: string,
  ): Promise<QuestionEntity> {
    return await checkExists<QuestionEntity>(
      this.questionRepository.findQuestionById(questionId),
      'Question Not Found',
    );
  }

  public async createQuestion(
    data: CreateQuestionDto,
  ): Promise<QuestionEntity> {
    await checkExists(
      this.questionRepository.findTestById(data.testId),
      'Test Not Found',
    );
    return this.questionRepository.createQuestion(data);
  }

  public async updateQuestion(
    questionId: string,
    data: UpdateQuestionDto,
  ): Promise<QuestionEntity> {
    await this.findQuestionByIdOrThrow(questionId);
    return this.questionRepository.updateQuestion(questionId, data);
  }

  public async deleteQuestion(questionId: string): Promise<QuestionEntity> {
    await this.findQuestionByIdOrThrow(questionId);
    return this.questionRepository.deleteQuestion(questionId);
  }
}
