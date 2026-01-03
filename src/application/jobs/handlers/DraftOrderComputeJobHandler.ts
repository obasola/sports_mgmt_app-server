import type { JobHandler } from '@/infrastructure/queue/InProcessJobRunner'
import type { ComputeCurrentDraftOrderUseCase } from '@/modules/draftOrder/application/usecases/ComputeCurrentDraftOrderUseCase'
import type { ComputeProjectedDraftOrderUseCase } from '@/modules/draftOrder/application/usecases/ComputeProjectedDraftOrderUseCase'
import { JobType } from '@/domain/jobs/value-objects/JobType'

type DraftOrderComputePayload = {
  readonly mode: 'current' | 'projection'
  readonly strategy?: string
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
}

export function draftOrderComputeHandler(
  computeCurrent: ComputeCurrentDraftOrderUseCase,
  computeProjected: ComputeProjectedDraftOrderUseCase
): JobHandler {
  return async (job, ctx) => {
    if (job.type !== JobType.DRAFT_ORDER_COMPUTE) {
      await ctx.log('error', `DRAFT_ORDER_COMPUTE handler received wrong type=${String(job.type)}`)
      return { code: 'ERROR' }
    }

    const payload = job.payload as DraftOrderComputePayload

    if (!payload?.seasonYear || typeof payload.seasonType !== 'number') {
      await ctx.log('error', `DRAFT_ORDER_COMPUTE missing params: ${JSON.stringify(job.payload)}`)
      return { code: 'ERROR' }
    }

    const mode = payload.mode
    const seasonYear = payload.seasonYear
    const seasonType = payload.seasonType
    const throughWeek = payload.throughWeek ?? null

    await ctx.log(
      'info',
      `Starting DRAFT_ORDER_COMPUTE mode=${mode} y=${seasonYear} st=${seasonType} throughWeek=${throughWeek ?? 'null'}`
    )

    if (mode === 'current') {
      const dto = await computeCurrent.execute({ seasonYear, seasonType, throughWeek })
      await ctx.log('info', `DRAFT_ORDER_COMPUTE current completed snapshotId=${dto.id}`)
      return { code: 'OK', result: { snapshotId: dto.id, mode: 'current' } }
    }

    const strategy = typeof payload.strategy === 'string' && payload.strategy.length > 0 ? payload.strategy : 'baseline'
    const dto = await computeProjected.execute({ seasonYear, seasonType, throughWeek, strategy })
    await ctx.log('info', `DRAFT_ORDER_COMPUTE projection completed snapshotId=${dto.id} strategy=${strategy}`)
    return { code: 'OK', result: { snapshotId: dto.id, mode: 'projection', strategy } }
  }
}
