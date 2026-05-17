import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestRepository } from './test.repository';
import { TestService } from './test.service';

@Module({
  controllers: [TestController],
  providers: [TestService, TestRepository],
  exports: [TestService],
})
export class TestModule {}
