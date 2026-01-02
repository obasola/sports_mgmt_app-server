import type { ListDraftOrderSnapshotsUseCase } from '../ListDraftOrderSnapshotsUseCase'
import type { ListDraftOrderSnapshotsQueryDto } from '../../dtos/ListDraftOrderSnapshotsQueryDto'
import type { DraftOrderSnapshotListItemDto } from '../../dtos/DraftOrderSnapshotListItemDto'
import type { PagedResultDto } from '../../dtos/PagedResultDto'
import { DraftOrderSnapshotListItem, DraftOrderSnapshotRepository } from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'

export class ListDraftOrderSnapshotsUseCaseImpl implements ListDraftOrderSnapshotsUseCase {
  constructor(private readonly repo: DraftOrderSnapshotRepository) {}

  async execute(query: ListDraftOrderSnapshotsQueryDto): Promise<PagedResultDto<DraftOrderSnapshotListItemDto>> {
    if (query.page < 1) throw new Error('page must be >= 1')
    if (query.pageSize < 1 || query.pageSize > 100) throw new Error('pageSize must be 1..100')

    const result: {
      readonly items: readonly DraftOrderSnapshotListItem[]
      readonly total: number
    } = await this.repo.listSnapshots({
      mode: query.mode,
      strategy: query.strategy,
      seasonYear: query.seasonYear,
      seasonType: query.seasonType,
      throughWeek: query.throughWeek,
      page: query.page,
      pageSize: query.pageSize,
    })

    const dtoItems: DraftOrderSnapshotListItemDto[] = result.items.map(
      (item: DraftOrderSnapshotListItem): DraftOrderSnapshotListItemDto => ({
        id: item.id,
        mode: item.mode,
        strategy: item.strategy,
        seasonYear: item.seasonYear,
        seasonType: item.seasonType,
        throughWeek: item.throughWeek,
        source: item.source,
        inputHash: item.inputHash,
        computedAt: item.computedAt.toISOString(),
        jobId: item.jobId,
        entryCount: item.entryCount,
      })
    )

    return {
      items: dtoItems,
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    }
  }
}
