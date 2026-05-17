import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ShowCorrectAfter } from '../../../generated/client/client';

export class CreateTestDto {
  @ApiProperty({ description: 'Display title of the quiz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional longer description shown to students',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Pass threshold between 0 and 1 (inclusive); defaults to 0',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  passThreshold?: number;

  @ApiPropertyOptional({
    description: 'Whether question order is shuffled for attempts',
  })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Whether answer options are shuffled per question',
  })
  @IsOptional()
  @IsBoolean()
  shuffleAnswers?: boolean;

  @ApiPropertyOptional({
    description: 'Optional time limit in seconds for one attempt',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum attempts per user; omit or null for unlimited',
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number | null;

  @ApiPropertyOptional({
    description: 'When correct answers may be revealed after grading',
    enum: ShowCorrectAfter,
  })
  @IsOptional()
  @IsEnum(ShowCorrectAfter)
  showCorrectAfter?: (typeof ShowCorrectAfter)[keyof typeof ShowCorrectAfter];

  @ApiPropertyOptional({
    description: 'Whether completing this test is required for lesson progress',
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
