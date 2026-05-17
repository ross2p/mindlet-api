import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Attempt } from '../../generated/client/client';
import { AttemptStatus } from '../../generated/client/client';

export class AttemptEntity implements Attempt {
  @ApiProperty({
    description: 'Unique identifier of the test attempt',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Quiz test id this attempt belongs to',
    format: 'uuid',
  })
  testId: string;

  @ApiProperty({
    description: 'User id who owns this attempt',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Lifecycle status of the attempt',
    enum: AttemptStatus,
  })
  status: Attempt['status'];

  @ApiPropertyOptional({
    description: 'Final normalized score between 0 and 1 after grading',
    nullable: true,
    minimum: 0,
    maximum: 1,
  })
  finalScore: number | null;

  @ApiPropertyOptional({
    description:
      'Whether the attempt met the test pass threshold after grading',
    nullable: true,
  })
  passed: boolean | null;

  @ApiProperty({
    description: 'When the student started this attempt',
    type: String,
    format: 'date-time',
  })
  startedAt: Date;

  @ApiPropertyOptional({
    description: 'When the attempt was submitted or fully graded',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  finishedAt: Date | null;

  @ApiProperty({
    description: 'Date and time when the attempt row was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the attempt row was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
