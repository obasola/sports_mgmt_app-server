import type { DraftOrderSnapshotDetailDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotDetailDto'

export interface ComputeProjectedDraftOrderParams {
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
  readonly strategy: string
}

export interface ComputeProjectedDraftOrderUseCase {
  execute(params: ComputeProjectedDraftOrderParams): Promise<DraftOrderSnapshotDetailDto>
}
