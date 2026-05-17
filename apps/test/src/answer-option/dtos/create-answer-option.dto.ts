import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAnswerOptionDto {
  @ApiProperty({
    description: 'Parent question id',
    format: 'uuid',
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({ description: 'Display text for this answer choice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;

  @ApiProperty({
    description: 'Whether this option counts as a correct answer',
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({
    description: 'Display order within the parent question',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  position: number;
}
