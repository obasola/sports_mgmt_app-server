// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/StartSimulationUseCase.ts
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { DraftStateDto } from '../dto/DraftStateDto'

export class StartSimulationUseCase {
  public constructor(private readonly repo: DraftSimulationRepository) {}

  public async execute(simulationId: number): Promise<DraftStateDto> {
    return this.repo.startSimulation(simulationId)
  }
}
