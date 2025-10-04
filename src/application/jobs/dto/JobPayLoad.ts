// src/application/jobs/dto/JobPayload.ts
import { JobType } from '../../../domain/jobs/value-objects/JobType';

export type SyncTeamsPayload = { seasonYear: number };
export type BackfillSeasonPayload = { seasonYear: number; seasonType: 1 | 2 | 3; week?: number };

export type JobPayload =
  | { type: JobType.SYNC_TEAMS; payload: SyncTeamsPayload }
  | { type: JobType.BACKFILL_SEASON; payload: BackfillSeasonPayload };
