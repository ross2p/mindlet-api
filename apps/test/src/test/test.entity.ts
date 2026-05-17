import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShowCorrectAfter, type Test } from '../../generated/client/client';

export class TestEntity implements Test {
  @ApiProperty({
    description: 'Unique identifier of the quiz test',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'Display title of the quiz' })
  title: string;

  @ApiPropertyOptional({
    description: 'Optional longer description shown to students',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Pass threshold between 0 and 1 (inclusive)',
    minimum: 0,
    maximum: 1,
  })
  passThreshold: number;

  @ApiProperty({
    description: 'Whether question order is shuffled for attempts',
  })
  shuffleQuestions: boolean;

  @ApiProperty({
    description: 'Whether answer options are shuffled per question',
  })
  shuffleAnswers: boolean;

  @ApiPropertyOptional({
    description: 'Optional time limit in seconds for one attempt',
    nullable: true,
  })
  timeLimitSeconds: number | null;

  @ApiPropertyOptional({
    description: 'Maximum attempts per user; null means unlimited',
    nullable: true,
  })
  maxAttempts: number | null;

  @ApiProperty({
    description: 'When correct answers may be revealed after grading',
    enum: ShowCorrectAfter,
  })
  showCorrectAfter: Test['showCorrectAfter'];

  @ApiProperty({
    description: 'Whether completing this test is required for lesson progress',
  })
  isRequired: boolean;

  @ApiProperty({
    description: 'Date and time when the test was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the test was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
