import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Question } from '../../generated/client/client';
import { GradingMode, QuestionType } from '../../generated/client/client';

export class QuestionEntity implements Question {
  @ApiProperty({
    description: 'Unique identifier of the question',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Parent quiz test id',
    format: 'uuid',
  })
  testId: string;

  @ApiProperty({
    description: 'Question input type (single choice, multi, free text, file)',
    enum: QuestionType,
  })
  type: Question['type'];

  @ApiProperty({
    description: 'Whether the question is graded automatically or manually',
    enum: GradingMode,
  })
  gradingMode: Question['gradingMode'];

  @ApiProperty({ description: 'Question prompt text shown to the student' })
  text: string;

  @ApiPropertyOptional({
    description: 'Optional explanation shown after grading',
    nullable: true,
  })
  explanation: string | null;

  @ApiProperty({
    description: 'Zero-based display order within the parent test',
    minimum: 0,
  })
  position: number;

  @ApiProperty({
    description: 'Date and time when the question was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the question was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
