import { Router } from 'express'
import { z } from 'zod'
import type { DraftOrderJobController } from '../controllers/DraftOrderJobController'

const QueueJobQuerySchema = z
  .object({
    seasonYear: z.string().regex(/^\d{4}$/),
    seasonType: z.coerce.number().int().min(1).max(3).default(2),
    throughWeek: z.coerce.number().int().min(0).max(25).optional(),
  })
  .passthrough()

const QueueProjectionJobQuerySchema = QueueJobQuerySchema.extend({
  strategy: z.string().min(1).max(64).optional(),
})

type QueueJobParsed = z.infer<typeof QueueJobQuerySchema>
type QueueProjectionJobParsed = z.infer<typeof QueueProjectionJobQuerySchema>

const toSeasonType = (n: number): 1 | 2 | 3 => (n === 1 ? 1 : n === 3 ? 3 : 2)

export function buildDraftOrderJobRoutes(controller: DraftOrderJobController): Router {
  const router = Router()

  router.post('/current', (req, res) => {
    const parsed: QueueJobParsed = QueueJobQuerySchema.parse(req.query)
    return controller.queueCurrent({
      seasonYear: parsed.seasonYear,
      seasonType: toSeasonType(parsed.seasonType),
      throughWeek: parsed.throughWeek,
    })(req, res)
  })

  router.post('/projection', (req, res) => {
    const parsed: QueueProjectionJobParsed = QueueProjectionJobQuerySchema.parse(req.query)
    return controller.queueProjection({
      seasonYear: parsed.seasonYear,
      seasonType: toSeasonType(parsed.seasonType),
      throughWeek: parsed.throughWeek,
      strategy: parsed.strategy,
    })(req, res)
  })

  return router
}
