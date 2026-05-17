import { Module } from '@nestjs/common';
import { AttemptController } from './attempt.controller';
import { AttemptRepository } from './attempt.repository';
import { AttemptService } from './attempt.service';

@Module({
  controllers: [AttemptController],
  providers: [AttemptService, AttemptRepository],
  exports: [AttemptService],
})
export class AttemptModule {}
