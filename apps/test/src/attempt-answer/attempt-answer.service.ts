import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateAttemptAnswerDto } from './dtos/create-attempt-answer.dto';
import { UpdateAttemptAnswerDto } from './dtos/update-attempt-answer.dto';
import { AttemptAnswerEntity } from './attempt-answer.entity';
import { AttemptAnswerRepository } from './attempt-answer.repository';

@Injectable()
export class AttemptAnswerService {
  constructor(
    private readonly attemptAnswerRepository: AttemptAnswerRepository,
  ) {}

  public async findAttemptAnswerByIdOrThrow(
    attemptAnswerId: string,
  ): Promise<AttemptAnswerEntity> {
    return await checkExists<AttemptAnswerEntity>(
      this.attemptAnswerRepository.findAttemptAnswerById(attemptAnswerId),
      'AttemptAnswer Not Found',
    );
  }

  public async createAttemptAnswer(
    data: CreateAttemptAnswerDto,
  ): Promise<AttemptAnswerEntity> {
    await checkExists(
      this.attemptAnswerRepository.findAttemptById(data.attemptId),
      'Attempt Not Found',
    );
    await checkExists(
      this.attemptAnswerRepository.findQuestionById(data.questionId),
      'Question Not Found',
    );
    return this.attemptAnswerRepository.createAttemptAnswer(data);
  }

  public async updateAttemptAnswer(
    attemptAnswerId: string,
    data: UpdateAttemptAnswerDto,
  ): Promise<AttemptAnswerEntity> {
    await this.findAttemptAnswerByIdOrThrow(attemptAnswerId);
    return this.attemptAnswerRepository.updateAttemptAnswer(
      attemptAnswerId,
      data,
    );
  }

  public async deleteAttemptAnswer(
    attemptAnswerId: string,
  ): Promise<AttemptAnswerEntity> {
    await this.findAttemptAnswerByIdOrThrow(attemptAnswerId);
    return this.attemptAnswerRepository.deleteAttemptAnswer(attemptAnswerId);
  }
}
