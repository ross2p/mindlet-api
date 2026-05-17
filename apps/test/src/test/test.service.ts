import { Injectable } from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { CreateTestDto } from './dtos/create-test.dto';
import { UpdateTestDto } from './dtos/update-test.dto';
import { TestEntity } from './test.entity';
import { TestRepository } from './test.repository';

@Injectable()
export class TestService {
  constructor(private readonly testRepository: TestRepository) {}

  public async findTestByIdOrThrow(testId: string): Promise<TestEntity> {
    return await checkExists<TestEntity>(
      this.testRepository.findTestById(testId),
      'Test Not Found',
    );
  }

  public async createTest(data: CreateTestDto): Promise<TestEntity> {
    return this.testRepository.createTest(data);
  }

  public async updateTest(
    testId: string,
    data: UpdateTestDto,
  ): Promise<TestEntity> {
    await this.findTestByIdOrThrow(testId);
    return this.testRepository.updateTest(testId, data);
  }

  public async deleteTest(testId: string): Promise<TestEntity> {
    await this.findTestByIdOrThrow(testId);
    return this.testRepository.deleteTest(testId);
  }
}
