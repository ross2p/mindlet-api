import { Module } from '@nestjs/common';
import { CorrectTextAnswerController } from './correct-text-answer.controller';
import { CorrectTextAnswerRepository } from './correct-text-answer.repository';
import { CorrectTextAnswerService } from './correct-text-answer.service';

@Module({
  controllers: [CorrectTextAnswerController],
  providers: [CorrectTextAnswerService, CorrectTextAnswerRepository],
  exports: [CorrectTextAnswerService],
})
export class CorrectTextAnswerModule {}
