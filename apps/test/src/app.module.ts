import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnswerOptionModule } from './answer-option/answer-option.module';
import { AttemptAnswerModule } from './attempt-answer/attempt-answer.module';
import { AttemptModule } from './attempt/attempt.module';
import { CorrectTextAnswerModule } from './correct-text-answer/correct-text-answer.module';
import { DatabaseModule } from './database/database.module';
import { QuestionModule } from './question/question.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TestModule,
    QuestionModule,
    AnswerOptionModule,
    CorrectTextAnswerModule,
    AttemptModule,
    AttemptAnswerModule,
  ],
})
export class AppModule {}
