import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateAttemptDto } from './dtos/create-attempt.dto';
import { UpdateAttemptDto } from './dtos/update-attempt.dto';
import { AttemptEntity } from './attempt.entity';
import { AttemptRepository } from './attempt.repository';

/**
 * TODO (submit / scoring / grading — next iteration):
 * - POST start attempt under a test with server-side time limit enforcement (07-tests A.8).
 * - POST submit with auto-scoring for AUTO questions, PENDING_GRADING when any MANUAL exists (A.5, A.7).
 * - Integrate manual grading flow from features/17-grading.md and emit test.attempt.* events.
 */
@Injectable()
export class AttemptService {
  constructor(private readonly attemptRepository: AttemptRepository) {}

  public async findAttemptByIdOrThrow(
    attemptId: string,
  ): Promise<AttemptEntity> {
    return await checkExists<AttemptEntity>(
      this.attemptRepository.findAttemptById(attemptId),
      'Attempt Not Found',
    );
  }

  public async createAttempt(data: CreateAttemptDto): Promise<AttemptEntity> {
    await checkExists(
      this.attemptRepository.findTestById(data.testId),
      'Test Not Found',
    );
    return this.attemptRepository.createAttempt(data);
  }

  public async updateAttempt(
    attemptId: string,
    data: UpdateAttemptDto,
  ): Promise<AttemptEntity> {
    await this.findAttemptByIdOrThrow(attemptId);
    return this.attemptRepository.updateAttempt(attemptId, data);
  }

  public async deleteAttempt(attemptId: string): Promise<AttemptEntity> {
    await this.findAttemptByIdOrThrow(attemptId);
    return this.attemptRepository.deleteAttempt(attemptId);
  }
}
