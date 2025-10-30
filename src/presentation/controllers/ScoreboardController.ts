import { Request, Response, Router } from 'express'
import { EspnScoreboardClient } from '@/infrastructure/scoreboardClient'
import { ScoreboardCurrentService } from '@/application/scoreboard/services/ScoreboardCurrentService'

export function buildScoreboardRouter() {
  const router = Router()
  const client = new EspnScoreboardClient()
  const service = new ScoreboardCurrentService(client)

  // GET /api/scoreboard/current
  router.get('/current', async (_req: Request, res: Response) => {
    try {
      const result = await service.getCurrentWeek()
      res.json(result)
    } catch (err: any) {
      console.error('❌ Failed to fetch current week:', err.message)
      res.status(500).json({ message: 'Failed to fetch current week', error: err.message })
    }
  })

  return router
}
