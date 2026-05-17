import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Question, Test } from '../../generated/client/client';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';

@Injectable()
export class QuestionRepository {
  constructor(private readonly db: DatabaseService) {}

  public findTestById(testId: string): Promise<Pick<Test, 'id'> | null> {
    return this.db.test.findUnique({
      where: { id: testId },
      select: { id: true },
    });
  }

  public findQuestionById(questionId: string): Promise<Question | null> {
    return this.db.question.findUnique({ where: { id: questionId } });
  }

  public createQuestion(data: CreateQuestionDto): Promise<Question> {
    return this.db.question.create({ data });
  }

  public updateQuestion(
    questionId: string,
    data: UpdateQuestionDto,
  ): Promise<Question> {
    return this.db.question.update({ where: { id: questionId }, data });
  }

  public deleteQuestion(questionId: string): Promise<Question> {
    return this.db.question.delete({ where: { id: questionId } });
  }
}
