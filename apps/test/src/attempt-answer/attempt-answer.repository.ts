import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  Attempt,
  AttemptAnswer,
  Question,
} from '../../generated/client/client';
import { CreateAttemptAnswerDto } from './dtos/create-attempt-answer.dto';
import { UpdateAttemptAnswerDto } from './dtos/update-attempt-answer.dto';

@Injectable()
export class AttemptAnswerRepository {
  constructor(private readonly db: DatabaseService) {}

  public findAttemptById(
    attemptId: string,
  ): Promise<Pick<Attempt, 'id'> | null> {
    return this.db.attempt.findUnique({
      where: { id: attemptId },
      select: { id: true },
    });
  }

  public findQuestionById(
    questionId: string,
  ): Promise<Pick<Question, 'id'> | null> {
    return this.db.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
  }

  public findAttemptAnswerById(
    attemptAnswerId: string,
  ): Promise<AttemptAnswer | null> {
    return this.db.attemptAnswer.findUnique({ where: { id: attemptAnswerId } });
  }

  public createAttemptAnswer(
    data: CreateAttemptAnswerDto,
  ): Promise<AttemptAnswer> {
    return this.db.attemptAnswer.create({
      data: {
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOptionIds: data.selectedOptionIds ?? [],
        textAnswer: data.textAnswer ?? null,
        fileId: data.fileId ?? null,
        qScore: data.qScore ?? null,
      },
    });
  }

  public updateAttemptAnswer(
    attemptAnswerId: string,
    data: UpdateAttemptAnswerDto,
  ): Promise<AttemptAnswer> {
    return this.db.attemptAnswer.update({
      where: { id: attemptAnswerId },
      data,
    });
  }

  public deleteAttemptAnswer(attemptAnswerId: string): Promise<AttemptAnswer> {
    return this.db.attemptAnswer.delete({ where: { id: attemptAnswerId } });
  }
}
