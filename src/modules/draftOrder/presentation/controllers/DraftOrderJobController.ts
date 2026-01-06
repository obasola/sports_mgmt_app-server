import type { Request, Response } from 'express'
import { JobType } from '@/domain/jobs/value-objects/JobType'
import type { QueueJobService } from '@/application/jobs/services/QueueJobService'
import type { RunJobService } from '@/application/jobs/services/RunJobService'

type QueueCurrentParsed = {
  readonly seasonYear: string
  readonly seasonType: 1 | 2 | 3
  readonly throughWeek?: number
}

type QueueProjectionParsed = QueueCurrentParsed & {
  readonly strategy?: string
}

export class DraftOrderJobController {
  public constructor(
    private readonly queueJobService: QueueJobService,
    private readonly runJobService: RunJobService
  ) {}

  public queueCurrent =
    (parsed: QueueCurrentParsed) =>
    async (_req: Request, res: Response): Promise<void> => {
      const job = await this.queueJobService.execute({
        type: JobType.DRAFT_ORDER_COMPUTE,
        payload: {
          mode: 'current',
          seasonYear: parsed.seasonYear,
          seasonType: parsed.seasonType,
          throughWeek: typeof parsed.throughWeek === 'number' ? parsed.throughWeek : null,
        },
      })

      if (typeof job.id !== 'number') {
        res.status(500).json({ error: 'Job queued but no job id was returned' })
        return
      }
      const jobId: number = job.id
      setImmediate(() => {
        void this.runJobService.execute(jobId).catch(() => {
          // swallow: RunJobService should mark failed + log
        })
      })

      res.status(202).json({ jobId: job.id })
    }

  public queueProjection =
    (parsed: QueueProjectionParsed) =>
    async (_req: Request, res: Response): Promise<void> => {
      const strategy =
        typeof parsed.strategy === 'string' && parsed.strategy.length > 0 ? parsed.strategy : 'baseline'

      const job = await this.queueJobService.execute({
        type: JobType.DRAFT_ORDER_COMPUTE,
        payload: {
          mode: 'projection',
          strategy,
          seasonYear: parsed.seasonYear,
          seasonType: parsed.seasonType,
          throughWeek: typeof parsed.throughWeek === 'number' ? parsed.throughWeek : null,
        },
      })

      if (typeof job.id !== 'number') {
        res.status(500).json({ error: 'Job queued but no job id was returned' })
        return
      }
      const jobId: number = job.id
      setImmediate(() => {
        void this.runJobService.execute(jobId).catch(() => {})
      })

      res.status(202).json({ jobId: job.id })
    }
}
