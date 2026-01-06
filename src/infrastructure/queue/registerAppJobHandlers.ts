import type { InProcessJobRunner, RunnerContext, RunResult } from '@/infrastructure/queue/InProcessJobRunner'
import { JobType } from '@/domain/jobs/value-objects/JobType'
import type { ComputeCurrentDraftOrderUseCase } from '@/modules/draftOrder/application/usecases/ComputeCurrentDraftOrderUseCase'
import type { ComputeProjectedDraftOrderUseCase } from '@/modules/draftOrder/application/usecases/ComputeProjectedDraftOrderUseCase'
import type { SyncWeekEventsService } from '@/application/schedule/services/SyncWeekEventsService'
import type { Job } from '@/domain/jobs/entities/Job'
import { nflEventsWeeklyHandler } from '@/application/jobs/handlers/NflEventsWeeklyJobHandler'

type Deps = {
  readonly syncWeekEventsSvc: SyncWeekEventsService
  readonly computeCurrentDraftOrderUc: ComputeCurrentDraftOrderUseCase
  readonly computeProjectedDraftOrderUc: ComputeProjectedDraftOrderUseCase
}

type DraftOrderComputePayload = {
  readonly mode: 'current' | 'projection'
  readonly strategy?: string
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
}

export function registerAppJobHandlers(runner: InProcessJobRunner, deps: Deps): void {
  // NFL events weekly (DI-provided)
  runner.register(JobType.NFL_EVENTS_WEEKLY, nflEventsWeeklyHandler(deps.syncWeekEventsSvc))
  runner.register(JobType.DRAFT_ORDER_COMPUTE, async (job: Job, ctx: RunnerContext): Promise<RunResult> => {
    const payload = job.payload as unknown as DraftOrderComputePayload

    if (!payload || (payload.mode !== 'current' && payload.mode !== 'projection')) {
      await ctx.log('error', `DRAFT_ORDER_COMPUTE missing/invalid mode: ${JSON.stringify(job.payload)}`)
      return { code: 'ERROR', result: { message: 'invalid payload' } }
    }

    await ctx.log('info', `DRAFT_ORDER_COMPUTE start mode=${payload.mode} y=${payload.seasonYear} st=${payload.seasonType} tw=${payload.throughWeek ?? 'null'}`)

    if (payload.mode === 'current') {
      const dto = await deps.computeCurrentDraftOrderUc.execute({
        seasonYear: payload.seasonYear,
        seasonType: payload.seasonType,
        throughWeek: payload.throughWeek,
      })

      await ctx.log('info', `DRAFT_ORDER_COMPUTE done snapshotId=${dto.id}`)
      return { code: 'OK', result: { snapshotId: dto.id, mode: 'current' } }
    }

    const strategy = typeof payload.strategy === 'string' && payload.strategy.length > 0 ? payload.strategy : 'baseline'
    const dto = await deps.computeProjectedDraftOrderUc.execute({
      seasonYear: payload.seasonYear,
      seasonType: payload.seasonType,
      throughWeek: payload.throughWeek,
      strategy,
    })

    await ctx.log('info', `DRAFT_ORDER_COMPUTE done snapshotId=${dto.id}`)
    return { code: 'OK', result: { snapshotId: dto.id, mode: 'projection', strategy } }
  })
}
