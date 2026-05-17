import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAttemptAnswerDto } from './create-attempt-answer.dto';

export class UpdateAttemptAnswerDto extends PartialType(
  OmitType(CreateAttemptAnswerDto, ['attemptId', 'questionId'] as const),
) {}
