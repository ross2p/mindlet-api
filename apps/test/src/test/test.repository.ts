import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Test } from '../../generated/client/client';
import { CreateTestDto } from './dtos/create-test.dto';
import { UpdateTestDto } from './dtos/update-test.dto';

@Injectable()
export class TestRepository {
  constructor(private readonly db: DatabaseService) {}

  public findTestById(testId: string): Promise<Test | null> {
    return this.db.test.findUnique({ where: { id: testId } });
  }

  public createTest(data: CreateTestDto): Promise<Test> {
    return this.db.test.create({ data });
  }

  public updateTest(testId: string, data: UpdateTestDto): Promise<Test> {
    return this.db.test.update({ where: { id: testId }, data });
  }

  public deleteTest(testId: string): Promise<Test> {
    return this.db.test.delete({ where: { id: testId } });
  }
}
