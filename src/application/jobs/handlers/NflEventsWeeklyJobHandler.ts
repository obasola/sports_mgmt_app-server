import { Job } from '@/domain/jobs/entities/Job'
import { JobHandler } from '@/infrastructure/queue/InProcessJobRunner'
import { SyncWeekEventsService } from '@/application/schedule/services/SyncWeekEventsService'

export function nflEventsWeeklyHandler(
  svc: SyncWeekEventsService
): JobHandler {
  return async (job, ctx) => {
    const payload = job.payload as { year: number; seasonType: number; week: number }

    if (!payload || !payload.year || !payload.seasonType || !payload.week) {
      await ctx.log('error', `NFL_EVENTS_WEEKLY missing params: ${JSON.stringify(job.payload)}`)
      return { code: 'ERROR' }
    }

    const { year, seasonType, week } = payload

    await ctx.log('info', `Starting NFL_EVENTS_WEEKLY y=${year} st=${seasonType} w=${week}`)

    const results = await svc.sync(year, seasonType, week)

    await ctx.log('info', `NFL_EVENTS_WEEKLY completed. Games processed = ${results.length}`)

    return { code: 'OK', result: { processed: results.length } }
  }
}
