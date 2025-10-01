// src/presentation/routes/jobs.scoreboard.schedule.ts
import { Router } from 'express'
import { getSchedule } from '@/services/ScoreboardScheduleService'
import { rescheduleCron } from '@/jobs/scoreboardCron'
import type { ScoreboardSchedule } from '@/types/scoreboardSchedule'

export const scoreboardScheduleRoutes = Router()

// GET /api/jobs/scoreboard/schedule
scoreboardScheduleRoutes.get('/', async (_req, res, next) => {
  try {
    const s = await getSchedule()
    res.json(s)
  } catch (e) { next(e) }
})

// PUT /api/jobs/scoreboard/schedule
scoreboardScheduleRoutes.put('/', async (req, res, next) => {
  try {
    const payload = req.body as ScoreboardSchedule
    await rescheduleCron(payload) // validates & persists + resets cron
    const s = await getSchedule()
    res.json(s)
  } catch (e) { next(e) }
})
