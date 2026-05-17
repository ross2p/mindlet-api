import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  CorrectTextAnswer,
  Question,
} from '../../generated/client/client';
import { CreateCorrectTextAnswerDto } from './dtos/create-correct-text-answer.dto';
import { UpdateCorrectTextAnswerDto } from './dtos/update-correct-text-answer.dto';

@Injectable()
export class CorrectTextAnswerRepository {
  constructor(private readonly db: DatabaseService) {}

  public findQuestionById(
    questionId: string,
  ): Promise<Pick<Question, 'id'> | null> {
    return this.db.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
  }

  public findCorrectTextAnswerById(
    correctTextAnswerId: string,
  ): Promise<CorrectTextAnswer | null> {
    return this.db.correctTextAnswer.findUnique({
      where: { id: correctTextAnswerId },
    });
  }

  public createCorrectTextAnswer(
    data: CreateCorrectTextAnswerDto,
  ): Promise<CorrectTextAnswer> {
    return this.db.correctTextAnswer.create({ data });
  }

  public updateCorrectTextAnswer(
    correctTextAnswerId: string,
    data: UpdateCorrectTextAnswerDto,
  ): Promise<CorrectTextAnswer> {
    return this.db.correctTextAnswer.update({
      where: { id: correctTextAnswerId },
      data,
    });
  }

  public deleteCorrectTextAnswer(
    correctTextAnswerId: string,
  ): Promise<CorrectTextAnswer> {
    return this.db.correctTextAnswer.delete({
      where: { id: correctTextAnswerId },
    });
  }
}
