import * as Joi from 'joi';
import type { CreateCorrectTextAnswerDto } from '../dtos/create-correct-text-answer.dto';

export const createCorrectTextAnswerSchema =
  Joi.object<CreateCorrectTextAnswerDto>({
    questionId: Joi.string().uuid().required().label('Question id').messages({
      'string.guid': `"Question id" must be a valid UUID`,
      'any.required': `"Question id" is required`,
    }),

    text: Joi.string()
      .trim()
      .min(1)
      .max(20000)
      .required()
      .label('Text')
      .messages({
        'string.empty': `"Text" cannot be empty`,
        'any.required': `"Text" is required`,
      }),
  });
