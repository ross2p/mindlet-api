import * as Joi from 'joi';
import type { UpdateAttemptAnswerDto } from '../dtos/update-attempt-answer.dto';

export const updateAttemptAnswerSchema = Joi.object<UpdateAttemptAnswerDto>({
  selectedOptionIds: Joi.array()
    .items(Joi.string().uuid())
    .label('Selected option ids')
    .optional(),

  textAnswer: Joi.string()
    .max(50000)
    .allow('', null)
    .label('Text answer')
    .optional(),

  fileId: Joi.string().uuid().allow(null).label('File id').optional(),

  qScore: Joi.number().min(0).max(1).allow(null).label('Q score').optional(),
});
