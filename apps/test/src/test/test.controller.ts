import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, ValidationPipe } from '@ross2p/common';
import { CreateTestDto } from './dtos/create-test.dto';
import { UpdateTestDto } from './dtos/update-test.dto';
import { createTestSchema } from './schemas/create-test.schema';
import { updateTestSchema } from './schemas/update-test.schema';
import { TestEntity } from './test.entity';
import { TestService } from './test.service';

@ApiTags('Test')
@ApiBearerAuth()
@Controller('test')
@UseGuards(AuthGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz test by id' })
  @ApiResponse({
    status: 200,
    description: 'Test found',
    type: TestEntity,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public findTestById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testService.findTestByIdOrThrow(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create quiz test configuration' })
  @ApiResponse({
    status: 201,
    description: 'Test created',
    type: TestEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public createTest(
    @Body(new ValidationPipe(createTestSchema)) dto: CreateTestDto,
  ) {
    return this.testService.createTest(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz test configuration' })
  @ApiResponse({
    status: 200,
    description: 'Test updated',
    type: TestEntity,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateTest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe(updateTestSchema)) dto: UpdateTestDto,
  ) {
    return this.testService.updateTest(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz test' })
  @ApiResponse({
    status: 200,
    description: 'Test deleted',
    type: TestEntity,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public deleteTest(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.testService.deleteTest(id);
  }
}
