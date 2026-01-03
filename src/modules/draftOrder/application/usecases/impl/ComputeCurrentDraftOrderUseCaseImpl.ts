import type { DraftOrderSnapshotDetailDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotDetailDto'
import type { DraftOrderSnapshotRepository } from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'
import type { GameFactsRepository } from '@/modules/draftOrder/domain/repositories/GameFactsRepository'
import type { ComputeCurrentDraftOrderParams, ComputeCurrentDraftOrderUseCase } from '@/modules/draftOrder/application/usecases/ComputeCurrentDraftOrderUseCase'
import { ComputeCurrentDraftOrderService } from '@/modules/draftOrder/application/services/ComputeCurrentDraftOrderService'

export class ComputeCurrentDraftOrderUseCaseImpl implements ComputeCurrentDraftOrderUseCase {
  public constructor(
    private readonly gamesRepo: GameFactsRepository,
    private readonly snapshotRepo: DraftOrderSnapshotRepository,
    private readonly computeSvc: ComputeCurrentDraftOrderService
  ) {}

  public async execute(params: ComputeCurrentDraftOrderParams): Promise<DraftOrderSnapshotDetailDto> {
    const games = await this.gamesRepo.listFinalGames({
      seasonYear: params.seasonYear,
      seasonType: params.seasonType,
      throughWeek: params.throughWeek,
    })

    const { snapshot } = this.computeSvc.compute({
      seasonYear: params.seasonYear,
      seasonType: params.seasonType,
      throughWeek: params.throughWeek,
      games,
    })

    return this.snapshotRepo.createSnapshot(snapshot)
  }
}
