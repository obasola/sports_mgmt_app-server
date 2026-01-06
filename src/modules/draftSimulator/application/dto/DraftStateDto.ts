// sports_mgmt_app_server/src/modules/draftSimulator/application/dto/DraftStateDto.ts
export interface DraftedProspectDto {
  id: number
  fullName: string
  position: string
  college: string
}

export interface DraftPickDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  originalTeamId: number
  currentTeamId: number
  currentTeamAbbr: string | null
  draftedProspectId: number | null
  draftedAt: string | null
  draftedProspect: DraftedProspectDto | null
}

export interface DraftStateDto {
  simulationId: number
  draftYear: number
  rounds: number
  draftSpeed: string
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  status: string
  currentOverallPick: number
  userTeamIds: number[]
  picks: DraftPickDto[]
}
