import { Router, type Request, type Response, type NextFunction } from 'express'
import { importWeekService } from '@/infrastructure/dependencies'

export const scoreboardJobs = Router()

// POST /jobs/kickoff/scoreboard/by-week  { "year":2025, "seasonType":2, "week":1 }
scoreboardJobs.post('/by-week', async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { year, seasonType, week } = req.body as { year?: number, seasonType: 1|2|3, week: number }
    if (!seasonType || week == null) {
      return res.status(400).json({ error: 'seasonType and week are required' })
    }
    // importWeekService.run returns { processed, failed, seasonYear, ... }
    const result = await importWeekService.run({ seasonType, week })
    return res.json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
})

/* also pass year
scoreboardJobs.post('/by-week', async (req, res, next) => {
  try {
    const { year, seasonType, week } = req.body as { year: number, seasonType: 1|2|3, week: number }
    if (!year || !seasonType || week == null) return res.status(400).json({ error: 'year, seasonType, week required' })
    const result = await importWeekService.importWeek({ year, seasonType, week })
    return res.json({ ok: true, ...result })
  } catch (err) {
    next(err)
  }
})

*/