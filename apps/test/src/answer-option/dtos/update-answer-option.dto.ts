import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class UpdateAnswerOptionDto extends PartialType(
  OmitType(CreateAnswerOptionDto, ['questionId'] as const),
) {}
