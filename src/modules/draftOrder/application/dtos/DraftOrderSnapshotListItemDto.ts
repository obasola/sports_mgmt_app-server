export interface DraftOrderSnapshotListItemDto {
  readonly id: number
  readonly mode: 'current' | 'projection'
  readonly strategy: string | null
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
  readonly source: string
  readonly inputHash: string
  readonly computedAt: string
  readonly jobId: number | null
  readonly entryCount: number
}
