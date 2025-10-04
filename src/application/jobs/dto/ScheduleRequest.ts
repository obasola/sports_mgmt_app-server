// src/application/jobs/dto/ScheduleRequest.ts
import { z } from 'zod';
import { CreateJobRequest } from './CreateJobRequest';

export const ScheduleRequest = z.object({
  cron: z.string().min(1), // e.g. "0 2 * * *"
  job: CreateJobRequest,
  active: z.boolean().default(true),
});
export type ScheduleRequest = z.infer<typeof ScheduleRequest>;
