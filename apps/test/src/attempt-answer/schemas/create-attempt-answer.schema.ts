import * as Joi from 'joi';
import type { CreateAttemptAnswerDto } from '../dtos/create-attempt-answer.dto';

export const createAttemptAnswerSchema = Joi.object<CreateAttemptAnswerDto>({
  attemptId: Joi.string().uuid().required().label('Attempt id').messages({
    'string.guid': `"Attempt id" must be a valid UUID`,
    'any.required': `"Attempt id" is required`,
  }),

  questionId: Joi.string().uuid().required().label('Question id').messages({
    'string.guid': `"Question id" must be a valid UUID`,
    'any.required': `"Question id" is required`,
  }),

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
