import * as Joi from 'joi';
import type { UpdateCorrectTextAnswerDto } from '../dtos/update-correct-text-answer.dto';

export const updateCorrectTextAnswerSchema =
  Joi.object<UpdateCorrectTextAnswerDto>({
    text: Joi.string()
      .trim()
      .min(1)
      .max(20000)
      .label('Text')
      .optional()
      .messages({
        'string.empty': `"Text" cannot be empty`,
      }),
  });
