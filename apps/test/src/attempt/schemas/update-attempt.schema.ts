import * as Joi from 'joi';
import { AttemptStatus } from '../../../generated/client/client';
import type { UpdateAttemptDto } from '../dtos/update-attempt.dto';

const attemptStatuses = Object.values(AttemptStatus) as string[];

export const updateAttemptSchema = Joi.object<UpdateAttemptDto>({
  status: Joi.string()
    .valid(...attemptStatuses)
    .label('Status')
    .optional(),

  finalScore: Joi.number()
    .min(0)
    .max(1)
    .allow(null)
    .label('Final score')
    .optional(),

  passed: Joi.boolean().allow(null).label('Passed').optional(),

  finishedAt: Joi.date().allow(null).label('Finished at').optional(),
});
