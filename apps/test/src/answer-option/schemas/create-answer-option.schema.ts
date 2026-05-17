import * as Joi from 'joi';
import type { CreateAnswerOptionDto } from '../dtos/create-answer-option.dto';

export const createAnswerOptionSchema = Joi.object<CreateAnswerOptionDto>({
  questionId: Joi.string().uuid().required().label('Question id').messages({
    'string.guid': `"Question id" must be a valid UUID`,
    'any.required': `"Question id" is required`,
  }),

  text: Joi.string()
    .trim()
    .min(1)
    .max(10000)
    .required()
    .label('Text')
    .messages({
      'string.empty': `"Text" cannot be empty`,
      'any.required': `"Text" is required`,
    }),

  isCorrect: Joi.boolean().required().label('Is correct').messages({
    'any.required': `"Is correct" is required`,
  }),

  position: Joi.number()
    .integer()
    .min(0)
    .required()
    .label('Position')
    .messages({
      'any.required': `"Position" is required`,
    }),
});
