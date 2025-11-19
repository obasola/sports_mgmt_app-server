// src/infrastructure/queue/InProcessJobRunner.ts
import { Job } from '@/domain/jobs/entities/Job'
import { JobType } from '@/domain/jobs/value-objects/JobType'
import {
  ScoreboardSyncService,
  ScoreboardSyncResult,
} from '@/application/scoreboard/services/ScoreboardSyncService'

// ❌ removed: import { syncWeekEventsService } from '@/infrastructure/dependencies'
// ⬆ this caused the circular import crash

// Handlers are provided from DI, NOT pulled from dependencies.ts
import { nflEventsWeeklyHandler } from '@/application/jobs/handlers/NflEventsWeeklyJobHandler'

export type RunResult = { code?: string; result?: Record<string, unknown> }

export interface RunnerContext {
  log: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string
  ) => Promise<void>
  shouldCancel: () => Promise<boolean>
}

export type JobHandler = (job: Job, ctx: RunnerContext) => Promise<RunResult>

export class InProcessJobRunner {
  private handlers = new Map<JobType, JobHandler>()

  register(type: JobType, handler: JobHandler) {
    this.handlers.set(type, handler)
  }

  async run(job: Job, ctx: RunnerContext): Promise<RunResult> {
    // 1. Check registered handlers from DI
    const handler = this.handlers.get(job.type)
    if (handler) return handler(job, ctx)

    // 2. Legacy switch
    switch (job.type) {
      case JobType.SCOREBOARD_SYNC: {
        const payload = job.payload as any
        const [, , yearArg, typeArg, weekArg] = payload

        const svc = new ScoreboardSyncService()
        try {
          const result = (await svc.runWeek({
            seasonYear: String(yearArg),
            seasonType: Number(typeArg) as 1 | 2 | 3,
            week: Number(weekArg),
          })) as ScoreboardSyncResult

          await svc.dispose()
          return { code: 'OK', result: result as any }
        } catch (err) {
          await svc.dispose()
          throw err
        }
      }

      default:
        throw new Error(`Unsupported job type: ${job.type}`)
    }
  }
}

/* ------------------------------------------------------------------------- */
/* Default handler registrations                                              */
/* ------------------------------------------------------------------------- */
export function registerDefaultHandlers(runner: InProcessJobRunner) {
  runner.register(JobType.SYNC_TEAMS, async (job, ctx) => {
    const { seasonYear } = (job.payload as any) ?? {}
    await ctx.log('info', `Starting sync for teams (${seasonYear})`)
    await sleepAndLog(ctx, 3, 'syncTeams')
    await ctx.log('info', 'Sync teams complete')
    return { code: 'OK', result: { synced: true } }
  })

  runner.register(JobType.BACKFILL_SEASON, async (job, ctx) => {
    const { seasonYear, seasonType, week } = (job.payload as any) ?? {}
    await ctx.log(
      'info',
      `Backfill season ${seasonYear}, type ${seasonType}${week ? `, week ${week}` : ''}`
    )
    await sleepAndLog(ctx, 5, 'backfillSeason')
    await ctx.log('info', 'Backfill complete')
    return { code: 'OK', result: { processed: true } }
  })
}

async function sleepAndLog(ctx: RunnerContext, steps: number, label: string) {
  for (let i = 1; i <= steps; i++) {
    if (await ctx.shouldCancel()) {
      await ctx.log('warn', `${label}: cancellation detected at step ${i}`)
      throw new Error('canceled')
    }
    await ctx.log('debug', `${label}: step ${i}/${steps}`)
    await new Promise((r) => setTimeout(r, 400))
  }
}
