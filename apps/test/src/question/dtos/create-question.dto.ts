import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { GradingMode, QuestionType } from '../../../generated/client/client';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Parent quiz test id',
    format: 'uuid',
  })
  @IsUUID()
  testId: string;

  @ApiProperty({
    description: 'Question input type',
    enum: QuestionType,
  })
  @IsEnum(QuestionType)
  type: (typeof QuestionType)[keyof typeof QuestionType];

  @ApiPropertyOptional({
    description: 'Grading mode; defaults to automatic grading',
    enum: GradingMode,
  })
  @IsOptional()
  @IsEnum(GradingMode)
  gradingMode?: (typeof GradingMode)[keyof typeof GradingMode];

  @ApiProperty({ description: 'Question prompt text shown to the student' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  text: string;

  @ApiPropertyOptional({
    description: 'Optional explanation shown after grading',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  explanation?: string | null;

  @ApiProperty({
    description: 'Zero-based display order within the parent test',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  position: number;
}
