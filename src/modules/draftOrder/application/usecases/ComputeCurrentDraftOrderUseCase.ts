import type { DraftOrderSnapshotDetailDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotDetailDto'

export interface ComputeCurrentDraftOrderParams {
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
}

export interface ComputeCurrentDraftOrderUseCase {
  execute(params: ComputeCurrentDraftOrderParams): Promise<DraftOrderSnapshotDetailDto>
}
