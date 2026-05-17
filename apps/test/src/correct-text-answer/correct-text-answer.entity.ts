import { ApiProperty } from '@nestjs/swagger';
import type { CorrectTextAnswer } from '../../generated/client/client';

export class CorrectTextAnswerEntity implements CorrectTextAnswer {
  @ApiProperty({
    description: 'Unique identifier of the correct text answer row',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Parent question id',
    format: 'uuid',
  })
  questionId: string;

  @ApiProperty({
    description: 'Canonical answer text used for automatic text grading',
  })
  text: string;

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
