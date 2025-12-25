// sports_mgmt_app_server/src/modules/draftSimulator/application/useCases/SimulateNextPickUseCase.ts
import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { ProspectRepository } from '../../domain/repositories/ProspectRepository'
import type { TeamNeedRepository } from '../../domain/repositories/TeamNeedRepository'
import type { DraftStateDto } from '../dto/DraftStateDto'
import { CpuDraftStrategy } from '../../infrastructure/services/CpuDraftStrategy'

export class SimulateNextPickUseCase {
  public constructor(
    private readonly simRepo: DraftSimulationRepository,
    private readonly prospectRepo: ProspectRepository,
    private readonly needRepo: TeamNeedRepository,
    private readonly cpu: CpuDraftStrategy
  ) {}

  public async execute(simulationId: number): Promise<DraftStateDto> {
    let state = await this.simRepo.getState(simulationId)
    if (state.status !== 'live') return state

    while (true) {
      const onClock = state.picks.find((p) => p.overallPick === state.currentOverallPick) ?? null
      if (!onClock) return state

      if (state.userTeamIds.includes(onClock.currentTeamId)) return state // stop: user on clock

      const available = await this.prospectRepo.listAvailable(simulationId, state.draftYear, state.rankingSource, {
        side: 'all',
        limit: 250
      })
      if (available.length === 0) return state

      const needs = await this.needRepo.getTeamNeedWeights(onClock.currentTeamId, state.draftYear)
      const chosen = this.cpu.pickProspect({ available, teamNeeds: needs })

      state = await this.simRepo.makePick({
        simulationId,
        overallPick: state.currentOverallPick,
        prospectId: chosen.id
      })

      if (state.status === 'complete') return state
    }
  }
}
