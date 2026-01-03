import { Prisma } from "@prisma/client"

export interface DraftOrderTeamInfoDto {
  readonly id: number
  readonly name: string
  readonly abbreviation: string | null
}

export interface DraftOrderTiebreakAuditDto {
  readonly id: number
  readonly stepNbr: number
  readonly ruleCode: string
  readonly resultCode: string
  readonly resultSummary: string
  readonly detailsJson: Prisma.JsonValue | null
  readonly createdAt: string
}

export interface DraftOrderEntryDetailDto {
  readonly id: number
  readonly draftSlot: number
  readonly isPlayoff: boolean
  readonly isProjected: boolean
  readonly wins: number
  readonly losses: number
  readonly ties: number
  readonly winPct: string
  readonly sos: string
  readonly pointsFor: number | null
  readonly pointsAgainst: number | null
  readonly team: DraftOrderTeamInfoDto
  readonly audits: readonly DraftOrderTiebreakAuditDto[]
}

export interface DraftOrderSnapshotDetailDto {
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
  readonly entries: readonly DraftOrderEntryDetailDto[]
}
