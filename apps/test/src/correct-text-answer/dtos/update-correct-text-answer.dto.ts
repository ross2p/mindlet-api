import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCorrectTextAnswerDto } from './create-correct-text-answer.dto';

export class UpdateCorrectTextAnswerDto extends PartialType(
  OmitType(CreateCorrectTextAnswerDto, ['questionId'] as const),
) {}
