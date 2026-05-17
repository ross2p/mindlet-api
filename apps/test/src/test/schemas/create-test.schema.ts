import * as Joi from 'joi';
import { ShowCorrectAfter } from '../../../generated/client/client';
import type { CreateTestDto } from '../dtos/create-test.dto';

const showCorrectAfterValues = Object.values(ShowCorrectAfter) as string[];

export const createTestSchema = Joi.object<CreateTestDto>({
  title: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .label('Title')
    .messages({
      'string.empty': `"Title" cannot be empty`,
      'any.required': `"Title" is required`,
    }),

  description: Joi.string().allow('', null).label('Description').optional(),

  passThreshold: Joi.number().min(0).max(1).label('Pass threshold').optional(),

  shuffleQuestions: Joi.boolean().label('Shuffle questions').optional(),

  shuffleAnswers: Joi.boolean().label('Shuffle answers').optional(),

  timeLimitSeconds: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .label('Time limit seconds')
    .optional(),

  maxAttempts: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .label('Max attempts')
    .optional(),

  showCorrectAfter: Joi.string()
    .valid(...showCorrectAfterValues)
    .label('Show correct after')
    .optional(),

  isRequired: Joi.boolean().label('Is required').optional(),
});
