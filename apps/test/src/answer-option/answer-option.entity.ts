import { ApiProperty } from '@nestjs/swagger';
import type { AnswerOption } from '../../generated/client/client';

export class AnswerOptionEntity implements AnswerOption {
  @ApiProperty({
    description: 'Unique identifier of the answer option',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Parent question id',
    format: 'uuid',
  })
  questionId: string;

  @ApiProperty({ description: 'Display text for this answer choice' })
  text: string;

  @ApiProperty({
    description: 'Whether this option counts as a correct answer',
  })
  isCorrect: boolean;

  @ApiProperty({
    description: 'Display order within the parent question',
    minimum: 0,
  })
  position: number;

  @ApiProperty({
    description: 'Date and time when the option was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the option was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
