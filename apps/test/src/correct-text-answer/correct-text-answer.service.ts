import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateCorrectTextAnswerDto } from './dtos/create-correct-text-answer.dto';
import { UpdateCorrectTextAnswerDto } from './dtos/update-correct-text-answer.dto';
import { CorrectTextAnswerEntity } from './correct-text-answer.entity';
import { CorrectTextAnswerRepository } from './correct-text-answer.repository';

@Injectable()
export class CorrectTextAnswerService {
  constructor(
    private readonly correctTextAnswerRepository: CorrectTextAnswerRepository,
  ) {}

  public async findCorrectTextAnswerByIdOrThrow(
    correctTextAnswerId: string,
  ): Promise<CorrectTextAnswerEntity> {
    return await checkExists<CorrectTextAnswerEntity>(
      this.correctTextAnswerRepository.findCorrectTextAnswerById(
        correctTextAnswerId,
      ),
      'CorrectTextAnswer Not Found',
    );
  }

  public async createCorrectTextAnswer(
    data: CreateCorrectTextAnswerDto,
  ): Promise<CorrectTextAnswerEntity> {
    await checkExists(
      this.correctTextAnswerRepository.findQuestionById(data.questionId),
      'Question Not Found',
    );
    return this.correctTextAnswerRepository.createCorrectTextAnswer(data);
  }

  public async updateCorrectTextAnswer(
    correctTextAnswerId: string,
    data: UpdateCorrectTextAnswerDto,
  ): Promise<CorrectTextAnswerEntity> {
    await this.findCorrectTextAnswerByIdOrThrow(correctTextAnswerId);
    return this.correctTextAnswerRepository.updateCorrectTextAnswer(
      correctTextAnswerId,
      data,
    );
  }

  public async deleteCorrectTextAnswer(
    correctTextAnswerId: string,
  ): Promise<CorrectTextAnswerEntity> {
    await this.findCorrectTextAnswerByIdOrThrow(correctTextAnswerId);
    return this.correctTextAnswerRepository.deleteCorrectTextAnswer(
      correctTextAnswerId,
    );
  }
}
