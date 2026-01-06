export type DraftOrderMode = 'current' | 'projection'

export interface ListDraftOrderSnapshotsQueryDto {
  readonly mode?: DraftOrderMode
  readonly strategy?: string
  readonly seasonYear?: string
  readonly seasonType?: number
  readonly throughWeek?: number
  readonly page: number
  readonly pageSize: number
}

