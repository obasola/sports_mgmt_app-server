import type { ListDraftOrderSnapshotsQueryDto } from '../dtos/ListDraftOrderSnapshotsQueryDto'
import type { DraftOrderSnapshotListItemDto } from '../dtos/DraftOrderSnapshotListItemDto'
import type { PagedResultDto } from '../dtos/PagedResultDto'

export interface ListDraftOrderSnapshotsUseCase {
  execute(query: ListDraftOrderSnapshotsQueryDto): Promise<PagedResultDto<DraftOrderSnapshotListItemDto>>
}
