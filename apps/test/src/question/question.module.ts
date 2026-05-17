import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionRepository } from './question.repository';
import { QuestionService } from './question.service';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
  exports: [QuestionService],
})
export class QuestionModule {}
