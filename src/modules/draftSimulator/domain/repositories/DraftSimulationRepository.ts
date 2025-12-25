// sports_mgmt_app_server/src/modules/draftSimulator/domain/repositories/DraftSimulationRepository.ts
import type { DraftStateDto } from '../../application/dto/DraftStateDto'

export interface CreateSimulationArgs {
  draftYear: number
  rounds: number
  draftSpeed: string
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  userTeamIds: number[]
}

export interface MakePickArgs {
  simulationId: number
  overallPick: number
  prospectId: number
}

export interface DraftSimulationRepository {
  createSimulation(args: CreateSimulationArgs): Promise<DraftStateDto>
  startSimulation(simulationId: number): Promise<DraftStateDto>
  getState(simulationId: number): Promise<DraftStateDto>
  makePick(args: MakePickArgs): Promise<DraftStateDto>
}
