import { Module } from '@nestjs/common';
import { AttemptAnswerController } from './attempt-answer.controller';
import { AttemptAnswerRepository } from './attempt-answer.repository';
import { AttemptAnswerService } from './attempt-answer.service';

@Module({
  controllers: [AttemptAnswerController],
  providers: [AttemptAnswerService, AttemptAnswerRepository],
  exports: [AttemptAnswerService],
})
export class AttemptAnswerModule {}
