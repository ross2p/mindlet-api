import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { CreateAttemptDto } from './create-attempt.dto';

export class UpdateAttemptDto extends PartialType(
  OmitType(CreateAttemptDto, ['testId', 'userId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Final normalized score between 0 and 1 after grading',
    minimum: 0,
    maximum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  finalScore?: number | null;

  @ApiPropertyOptional({
    description:
      'Whether the attempt met the test pass threshold after grading',
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  passed?: boolean | null;

  @ApiPropertyOptional({
    description: 'When the attempt was submitted or fully graded',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  finishedAt?: Date | null;
}
