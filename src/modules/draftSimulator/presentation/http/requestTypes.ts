// sports_mgmt_app_server/src/modules/draftSimulator/presentation/http/requestTypes.ts
export interface CreateSimulationBody {
  draftYear: number
  rounds: number
  draftSpeed: 'slow' | 'normal' | 'fast'
  rankingSource: 'consensus' | 'pfsn' | 'espn' | 'pff' | 'athletic'
  allowTrades: boolean
  cpuCpuTrades: boolean
  userTeamIds: number[]
}

export interface ListProspectsQuery {
  q?: string
  side?: 'all' | 'offense' | 'defense' | 'st'
  position?: string
}

export interface MakePickBody {
  overallPick: number
  prospectId: number
}
