import * as Joi from 'joi';
import type { UpdateAnswerOptionDto } from '../dtos/update-answer-option.dto';

export const updateAnswerOptionSchema = Joi.object<UpdateAnswerOptionDto>({
  text: Joi.string()
    .trim()
    .min(1)
    .max(10000)
    .label('Text')
    .optional()
    .messages({
      'string.empty': `"Text" cannot be empty`,
    }),

  isCorrect: Joi.boolean().label('Is correct').optional(),

  position: Joi.number().integer().min(0).label('Position').optional(),
});
