import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Attempt, Test } from '../../generated/client/client';
import { CreateAttemptDto } from './dtos/create-attempt.dto';
import { UpdateAttemptDto } from './dtos/update-attempt.dto';

@Injectable()
export class AttemptRepository {
  constructor(private readonly db: DatabaseService) {}

  public findTestById(testId: string): Promise<Pick<Test, 'id'> | null> {
    return this.db.test.findUnique({
      where: { id: testId },
      select: { id: true },
    });
  }

  public findAttemptById(attemptId: string): Promise<Attempt | null> {
    return this.db.attempt.findUnique({ where: { id: attemptId } });
  }

  public createAttempt(data: CreateAttemptDto): Promise<Attempt> {
    return this.db.attempt.create({
      data: {
        testId: data.testId,
        userId: data.userId,
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  public updateAttempt(
    attemptId: string,
    data: UpdateAttemptDto,
  ): Promise<Attempt> {
    return this.db.attempt.update({ where: { id: attemptId }, data });
  }

  public deleteAttempt(attemptId: string): Promise<Attempt> {
    return this.db.attempt.delete({ where: { id: attemptId } });
  }
}
