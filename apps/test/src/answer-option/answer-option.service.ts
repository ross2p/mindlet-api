import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateAnswerOptionDto } from './dtos/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './dtos/update-answer-option.dto';
import { AnswerOptionEntity } from './answer-option.entity';
import { AnswerOptionRepository } from './answer-option.repository';

@Injectable()
export class AnswerOptionService {
  constructor(
    private readonly answerOptionRepository: AnswerOptionRepository,
  ) {}

  public async findAnswerOptionByIdOrThrow(
    answerOptionId: string,
  ): Promise<AnswerOptionEntity> {
    return await checkExists<AnswerOptionEntity>(
      this.answerOptionRepository.findAnswerOptionById(answerOptionId),
      'AnswerOption Not Found',
    );
  }

  public async createAnswerOption(
    data: CreateAnswerOptionDto,
  ): Promise<AnswerOptionEntity> {
    await checkExists(
      this.answerOptionRepository.findQuestionById(data.questionId),
      'Question Not Found',
    );
    return this.answerOptionRepository.createAnswerOption(data);
  }

  public async updateAnswerOption(
    answerOptionId: string,
    data: UpdateAnswerOptionDto,
  ): Promise<AnswerOptionEntity> {
    await this.findAnswerOptionByIdOrThrow(answerOptionId);
    return this.answerOptionRepository.updateAnswerOption(answerOptionId, data);
  }

  public async deleteAnswerOption(
    answerOptionId: string,
  ): Promise<AnswerOptionEntity> {
    await this.findAnswerOptionByIdOrThrow(answerOptionId);
    return this.answerOptionRepository.deleteAnswerOption(answerOptionId);
  }
}
