import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AttemptAnswer } from '../../generated/client/client';

export class AttemptAnswerEntity implements AttemptAnswer {
  @ApiProperty({
    description: 'Unique identifier of the attempt answer row',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Parent attempt id',
    format: 'uuid',
  })
  attemptId: string;

  @ApiProperty({
    description: 'Question id this answer refers to',
    format: 'uuid',
  })
  questionId: string;

  @ApiProperty({
    description:
      'Selected answer option ids for SINGLE/MULTI questions (empty for TEXT/FILE)',
    type: [String],
    format: 'uuid',
    isArray: true,
  })
  selectedOptionIds: string[];

  @ApiPropertyOptional({
    description: 'Free-text answer for TEXT questions',
    nullable: true,
  })
  textAnswer: string | null;

  @ApiPropertyOptional({
    description: 'Uploaded file id for FILE questions (storage service)',
    format: 'uuid',
    nullable: true,
  })
  fileId: string | null;

  @ApiPropertyOptional({
    description: 'Per-question score between 0 and 1 after grading',
    nullable: true,
    minimum: 0,
    maximum: 1,
  })
  qScore: number | null;

  @ApiProperty({
    description: 'Date and time when the row was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the row was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
