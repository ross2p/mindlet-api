import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { AnswerOption, Question } from '../../generated/client/client';
import { CreateAnswerOptionDto } from './dtos/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './dtos/update-answer-option.dto';

@Injectable()
export class AnswerOptionRepository {
  constructor(private readonly db: DatabaseService) {}

  public findQuestionById(
    questionId: string,
  ): Promise<Pick<Question, 'id'> | null> {
    return this.db.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
  }

  public findAnswerOptionById(
    answerOptionId: string,
  ): Promise<AnswerOption | null> {
    return this.db.answerOption.findUnique({ where: { id: answerOptionId } });
  }

  public createAnswerOption(
    data: CreateAnswerOptionDto,
  ): Promise<AnswerOption> {
    return this.db.answerOption.create({ data });
  }

  public updateAnswerOption(
    answerOptionId: string,
    data: UpdateAnswerOptionDto,
  ): Promise<AnswerOption> {
    return this.db.answerOption.update({
      where: { id: answerOptionId },
      data,
    });
  }

  public deleteAnswerOption(answerOptionId: string): Promise<AnswerOption> {
    return this.db.answerOption.delete({ where: { id: answerOptionId } });
  }
}
