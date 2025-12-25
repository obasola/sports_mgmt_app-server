// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/ListProspectsUseCase.ts
import type { ProspectRepository } from '../../domain/repositories/ProspectRepository'
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { ProspectListItemDto } from '../dto/ProspectListDto'

export interface ListProspectsRequest {
  q?: string
  side?: 'all' | 'offense' | 'defense' | 'st'
  position?: string
}

export class ListProspectsUseCase {
  public constructor(
    private readonly simRepo: DraftSimulationRepository,
    private readonly prospectRepo: ProspectRepository
  ) {}

  public async execute(simulationId: number, req: ListProspectsRequest): Promise<ProspectListItemDto[]> {
    const state = await this.simRepo.getState(simulationId)
    return this.prospectRepo.listForUi(simulationId, state.draftYear, state.rankingSource, {
      q: req.q,
      side: req.side ?? 'all',
      position: req.position,
      limit: 200
    })
  }
}
