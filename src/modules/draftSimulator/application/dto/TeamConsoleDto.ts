export interface TeamConsoleNeedDto {
  position: string
  priority: number           // 1..5 (1 highest)
  baseWeight: number         // 1..5 (derived from priority)
  draftedCount: number       // how many drafted at this position by this team
  adjustedWeight: number     // baseWeight minus draftedCount, floored at 1
}

export type RunSeverity = 'warm' | 'hot'

export interface PositionRunWarningDto {
  position: string
  count: number              // picks in window
  window: number             // e.g., last 10 picks
  severity: RunSeverity      // warm=3, hot>=4
  relevantToNeeds: boolean   // intersects team needs (adjustedWeight>=3)
}

export interface TeamConsolePickDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  teamId: number
  teamAbbr: string | null
}

export interface TeamConsoleOnClockDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  teamId: number
  teamAbbr: string | null
}

export interface TeamConsoleDto {
  simulationId: number
  draftYear: number
  onClock: TeamConsoleOnClockDto | null
  needsRemaining: TeamConsoleNeedDto[]      // ✅ smarter list
  runWarnings: PositionRunWarningDto[]      // ✅ PFN-style warnings
  nextPicks: TeamConsolePickDto[]
}
