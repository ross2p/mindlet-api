import * as Joi from 'joi';
import { AttemptStatus } from '../../../generated/client/client';
import type { CreateAttemptDto } from '../dtos/create-attempt.dto';

const attemptStatuses = Object.values(AttemptStatus) as string[];

export const createAttemptSchema = Joi.object<CreateAttemptDto>({
  testId: Joi.string().uuid().required().label('Test id').messages({
    'string.guid': `"Test id" must be a valid UUID`,
    'any.required': `"Test id" is required`,
  }),

  userId: Joi.string().uuid().required().label('User id').messages({
    'string.guid': `"User id" must be a valid UUID`,
    'any.required': `"User id" is required`,
  }),

  status: Joi.string()
    .valid(...attemptStatuses)
    .label('Status')
    .optional(),
});
