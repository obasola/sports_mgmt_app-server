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
  readonly detailsJson: unknown | null;
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
  readonly team: DraftOrderTeamInfo;
  readonly audits: readonly DraftOrderTiebreakAuditRow[];
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
  listSnapshots(
    params: ListDraftOrderSnapshotsParams
  ): Promise<{ readonly items: readonly DraftOrderSnapshotListItem[]; readonly total: number }>;

  getSnapshotById(id: number): Promise<DraftOrderSnapshotDetail | null>;
}
