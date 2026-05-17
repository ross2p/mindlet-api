import * as Joi from 'joi';
import { GradingMode, QuestionType } from '../../../generated/client/client';
import type { UpdateQuestionDto } from '../dtos/update-question.dto';

const questionTypes = Object.values(QuestionType) as string[];
const gradingModes = Object.values(GradingMode) as string[];

export const updateQuestionSchema = Joi.object<UpdateQuestionDto>({
  type: Joi.string()
    .valid(...questionTypes)
    .label('Question type')
    .optional(),

  gradingMode: Joi.string()
    .valid(...gradingModes)
    .label('Grading mode')
    .optional(),

  text: Joi.string()
    .trim()
    .min(1)
    .max(20000)
    .label('Text')
    .optional()
    .messages({
      'string.empty': `"Text" cannot be empty`,
    }),

  explanation: Joi.string().allow('', null).label('Explanation').optional(),

  position: Joi.number().integer().min(0).label('Position').optional(),
});
