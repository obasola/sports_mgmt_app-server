// src/application/jobs/dto/CreateJobRequest.ts
import { z } from 'zod';
import { JobType } from '../../../domain/jobs/value-objects/JobType';
import { SeasonType } from '@/domain/game/value-objects/SeasonType';

export const CreateJobRequest = z.discriminatedUnion('type', [

  // ───────────────────────────────
  // 1. SYNC_TEAMS
  // ───────────────────────────────
  z.object({
    type: z.literal(JobType.SYNC_TEAMS),
    payload: z.object({
      seasonYear: z.number().int(),
    }),
  }),

  // ───────────────────────────────
  // 2. BACKFILL_SEASON
  // ───────────────────────────────
  z.object({
    type: z.literal(JobType.BACKFILL_SEASON),
    payload: z.object({
      seasonYear: z.number().int(),
      seasonType: z.nativeEnum(SeasonType),
      week: z.number().int().optional(),
    }),
  }),

  // ───────────────────────────────
  // 3. NFL_EVENTS_WEEKLY  ← REQUIRED!!!
  // ───────────────────────────────
  z.object({
    type: z.literal(JobType.NFL_EVENTS_WEEKLY),
    payload: z.object({
      year: z.number().int(),
      seasonType: z.nativeEnum(SeasonType),
      week: z.number().int(),
    }),
  }),

]);

export type CreateJobRequest = z.infer<typeof CreateJobRequest>;
