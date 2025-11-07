import { Router, type Request, type Response, type NextFunction } from 'express'
import { importWeekService } from '@/infrastructure/dependencies'
import { queueJobService } from '@/infrastructure/dependencies'

export const scoreboardJobs = Router()

// POST /jobs/kickoff/scoreboard/by-week  { "year":2025, "seasonType":2, "week":1 }
scoreboardJobs.post('/kickoff/scoreboard/by-week', async (req, res, next) => {
  try {
    const { year, seasonType, week } = req.body;

    if (!year || !seasonType || !week) {
      return res.status(400).json({ error: 'year, seasonType, and week are required' });
    }
    const result = await importWeekService.run({ seasonYear: String(year), seasonType, week })

    return res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
    return res.status(500).json({ err });
  }
});


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