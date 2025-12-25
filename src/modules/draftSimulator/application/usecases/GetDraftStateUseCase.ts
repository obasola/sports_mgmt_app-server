// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/GetDraftStateUseCase.ts
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { DraftStateDto } from '../dto/DraftStateDto'

export class GetDraftStateUseCase {
  public constructor(private readonly repo: DraftSimulationRepository) {}

  public async execute(simulationId: number): Promise<DraftStateDto> {
    return this.repo.getState(simulationId)
  }
}
