// src/application/jobs/dto/CreateJobRequest.ts
import { z } from 'zod';
import { JobType } from '../../../domain/jobs/value-objects/JobType';

export const CreateJobRequest = z.discriminatedUnion('type', [
  z.object({ type: z.literal(JobType.SYNC_TEAMS), payload: z.object({ seasonYear: z.number().int() }) }),
  z.object({
    type: z.literal(JobType.BACKFILL_SEASON),
    payload: z.object({ seasonYear: z.number().int(), seasonType: z.union([z.literal(1), z.literal(2), z.literal(3)]), week: z.number().int().optional() }),
  }),
]);
export type CreateJobRequest = z.infer<typeof CreateJobRequest>;
