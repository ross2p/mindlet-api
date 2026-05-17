import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttemptAnswerDto {
  @ApiProperty({
    description: 'Parent attempt id',
    format: 'uuid',
  })
  @IsUUID()
  attemptId: string;

  @ApiProperty({
    description: 'Question id this answer refers to',
    format: 'uuid',
  })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({
    description:
      'Selected answer option ids for SINGLE/MULTI questions; omit or empty otherwise',
    type: [String],
    format: 'uuid',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedOptionIds?: string[];

  @ApiPropertyOptional({
    description: 'Free-text answer for TEXT questions',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  textAnswer?: string | null;

  @ApiPropertyOptional({
    description: 'Uploaded file id for FILE questions',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  fileId?: string | null;

  @ApiPropertyOptional({
    description: 'Per-question score between 0 and 1 after grading',
    minimum: 0,
    maximum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  qScore?: number | null;
}
