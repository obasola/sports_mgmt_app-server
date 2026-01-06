// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/MakePickUseCase.ts
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { DraftStateDto } from '../dto/DraftStateDto'

export interface MakePickRequest {
  overallPick: number
  prospectId: number
}

export class MakePickUseCase {
  public constructor(private readonly simRepo: DraftSimulationRepository) {}

  public async execute(simulationId: number, req: MakePickRequest): Promise<DraftStateDto> {
    return this.simRepo.makePick({ simulationId, overallPick: req.overallPick, prospectId: req.prospectId })
  }
}
