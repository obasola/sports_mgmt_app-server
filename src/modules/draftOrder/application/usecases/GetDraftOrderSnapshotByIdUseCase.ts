import type { DraftOrderSnapshotDetailDto } from '../dtos/DraftOrderSnapshotDetailDto'

export interface GetDraftOrderSnapshotByIdUseCase {
  execute(id: number): Promise<DraftOrderSnapshotDetailDto | null>
}
