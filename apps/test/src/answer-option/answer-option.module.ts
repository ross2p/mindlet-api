import { Module } from '@nestjs/common';
import { AnswerOptionController } from './answer-option.controller';
import { AnswerOptionRepository } from './answer-option.repository';
import { AnswerOptionService } from './answer-option.service';

@Module({
  controllers: [AnswerOptionController],
  providers: [AnswerOptionService, AnswerOptionRepository],
  exports: [AnswerOptionService],
})
export class AnswerOptionModule {}
