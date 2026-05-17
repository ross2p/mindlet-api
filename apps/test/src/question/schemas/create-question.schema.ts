import * as Joi from 'joi';
import { GradingMode, QuestionType } from '../../../generated/client/client';
import type { CreateQuestionDto } from '../dtos/create-question.dto';

const questionTypes = Object.values(QuestionType) as string[];
const gradingModes = Object.values(GradingMode) as string[];

export const createQuestionSchema = Joi.object<CreateQuestionDto>({
  testId: Joi.string().uuid().required().label('Test id').messages({
    'string.guid': `"Test id" must be a valid UUID`,
    'any.required': `"Test id" is required`,
  }),

  type: Joi.string()
    .valid(...questionTypes)
    .required()
    .label('Question type')
    .messages({
      'any.required': `"Question type" is required`,
    }),

  gradingMode: Joi.string()
    .valid(...gradingModes)
    .label('Grading mode')
    .optional(),

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

  explanation: Joi.string().allow('', null).label('Explanation').optional(),

  position: Joi.number()
    .integer()
    .min(0)
    .required()
    .label('Position')
    .messages({
      'any.required': `"Position" is required`,
    }),
});
