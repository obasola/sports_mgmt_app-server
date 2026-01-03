// src/application/jobs/dto/JobPayload.ts
import { JobType } from '../../../domain/jobs/value-objects/JobType';

export type SyncTeamsPayload = { seasonYear: number };
export type BackfillSeasonPayload = { seasonYear: number; seasonType: 1 | 2 | 3; week?: number };

export type DraftOrderComputePayload = {
  readonly mode: 'current' | 'projection'
  readonly strategy?: string
  readonly seasonYear: string // 4-digit string, matches draftOrder API
  readonly seasonType: 1 | 2 | 3
  readonly throughWeek: number | null
}
export type JobPayload =
  | { type: JobType.SYNC_TEAMS; payload: SyncTeamsPayload }
  | { type: JobType.BACKFILL_SEASON; payload: BackfillSeasonPayload }
  | { type: JobType.DRAFT_ORDER_COMPUTE; payload: DraftOrderComputePayload };
