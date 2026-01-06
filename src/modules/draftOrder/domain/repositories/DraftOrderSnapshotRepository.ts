// src/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository

import type { DraftOrderSnapshotDetailDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotDetailDto'
import type { ListDraftOrderSnapshotsQueryDto } from '@/modules/draftOrder/application/dtos/ListDraftOrderSnapshotsQueryDto'
import type { PagedResultDto } from '@/modules/draftOrder/application/dtos/PagedResultDto'
import type { DraftOrderSnapshotListItemDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotListItemDto'
import { Prisma } from '@prisma/client';


export type DraftOrderMode = 'current' | 'projection';

export interface ListDraftOrderSnapshotsParams {
  readonly mode?: DraftOrderMode;
  readonly strategy?: string;
  readonly seasonYear?: string;
  readonly seasonType?: number;
  readonly throughWeek?: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface DraftOrderSnapshotListItem {
  readonly id: number;
  readonly mode: DraftOrderMode;
  readonly strategy: string | null;
  readonly seasonYear: string;
  readonly seasonType: number;
  readonly throughWeek: number | null;
  readonly source: string;
  readonly inputHash: string;
  readonly computedAt: Date;
  readonly jobId: number | null;
  readonly entryCount: number;
}

export interface DraftOrderTeamInfo {
  readonly id: number;
  readonly name: string;
  readonly abbreviation: string | null;
}

export interface DraftOrderTiebreakAuditRow {
  readonly id: number;
  readonly stepNbr: number;
  readonly ruleCode: string;
  readonly resultCode: string;
  readonly resultSummary: string;
  readonly detailsJson: Prisma.JsonValue | null;
  readonly createdAt: Date;
}

export interface DraftOrderEntryDetail {
  readonly id: number;
  readonly draftSlot: number;
  readonly isPlayoff: boolean;
  readonly isProjected: boolean;
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly winPct: string;
  readonly sos: string;
  readonly pointsFor: number | null;
  readonly pointsAgainst: number | null;
  readonly teamId: number;
  readonly team: DraftOrderTeamInfo;
  readonly audits: readonly DraftOrderTiebreakAuditRow[];
}

export interface CreateDraftOrderSnapshotRequest {
  readonly mode: 'current' | 'projection'
  readonly strategy: string | null
  readonly seasonYear: string // matches Prisma (VarChar(4))
  readonly seasonType: number
  readonly throughWeek: number | null
  readonly source: string
  readonly inputHash: string // sha256
  readonly computedAt: Date

  readonly entries: ReadonlyArray<CreateDraftOrderEntryRequest>
}

export interface CreateDraftOrderEntryRequest {
  readonly teamId: number
  readonly draftSlot: number
  readonly isPlayoff: boolean
  readonly isProjected: boolean
  readonly wins: number
  readonly losses: number
  readonly ties: number
  readonly winPct: string // Prisma Decimal acceptable as string
  readonly sos: string // Prisma Decimal acceptable as string
  readonly pointsFor: number | null
  readonly pointsAgainst: number | null

  readonly audits: ReadonlyArray<CreateDraftOrderTiebreakAuditRequest>
}

export interface CreateDraftOrderTiebreakAuditRequest {
  readonly stepNbr: number
  readonly ruleCode: string
  readonly resultCode: string
  readonly resultSummary: string
  readonly detailsJson: Prisma.JsonValue | null
}

export interface DraftOrderSnapshotDetail {
  readonly id: number;
  readonly mode: DraftOrderMode;
  readonly strategy: string | null;
  readonly seasonYear: string;
  readonly seasonType: number;
  readonly throughWeek: number | null;
  readonly source: string;
  readonly inputHash: string;
  readonly computedAt: Date;
  readonly jobId: number | null;
  readonly entries: readonly DraftOrderEntryDetail[];
}

export interface DraftOrderSnapshotRepository {
  
  listPaged(query: ListDraftOrderSnapshotsQueryDto): Promise<PagedResultDto<DraftOrderSnapshotListItemDto>>
  
  listSnapshots(
    params: ListDraftOrderSnapshotsParams
  ): Promise<{ readonly items: readonly DraftOrderSnapshotListItem[]; readonly total: number }>;

  getSnapshotById(id: number): Promise<DraftOrderSnapshotDetail | null>;
  getById(snapshotId: number): Promise<DraftOrderSnapshotDetailDto | null>
  // NEW (persistence milestone)
  createSnapshot(req: CreateDraftOrderSnapshotRequest): Promise<DraftOrderSnapshotDetailDto>
}