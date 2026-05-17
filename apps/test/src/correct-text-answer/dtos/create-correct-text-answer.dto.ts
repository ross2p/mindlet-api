import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCorrectTextAnswerDto {
  @ApiProperty({
    description: 'Parent question id',
    format: 'uuid',
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Canonical answer text used for automatic text grading',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  text: string;
}
