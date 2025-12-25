// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/CreateSimulationUseCase.ts
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { DraftStateDto } from '../dto/DraftStateDto'

export interface CreateSimulationRequest {
  draftYear: number
  rounds: number
  draftSpeed: string
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  userTeamIds: number[]
}

export class CreateSimulationUseCase {
  public constructor(private readonly repo: DraftSimulationRepository) {}

  public async execute(req: CreateSimulationRequest): Promise<DraftStateDto> {
    return this.repo.createSimulation(req)
  }
}
