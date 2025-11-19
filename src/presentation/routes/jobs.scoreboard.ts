// ================================================================
// src/presentation/routes/job.scoreboard.ts
// Lightweight REST Endpoints for Scoreboard Sync
// ================================================================
import { Router } from 'express'

import {
  scoreboardSyncService,
  syncWeekEventsService
} from '@/infrastructure/dependencies'

export const scoreboardJobs = Router()

// ------------------------------------------------------------
// Import Scores by Week (Scoreboard)
// ------------------------------------------------------------
scoreboardJobs.post('/kickoff/scoreboard/by-week', async (req, res) => {
  const { year, seasonType, week } = req.body

  if (!year || !seasonType || !week)
    return res.status(400).json({ error: 'year, seasonType, week are required' })

  try {
    const result = await scoreboardSyncService.runWeek({
      seasonYear: String(year),
      seasonType: Number(seasonType) as any,
      week: Number(week)
    })

    return res.json({ ok: true, ...result })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// ------------------------------------------------------------
// Import Schedule (Events) by Week
// ------------------------------------------------------------
scoreboardJobs.post('/kickoff/schedule/by-week', async (req, res) => {
  const { year, seasonType, week } = req.body

  if (!year || !seasonType || !week)
    return res.status(400).json({ error: 'year, seasonType, week are required' })

  try {
    const result = await syncWeekEventsService.sync(
      year,
      Number(seasonType),
      Number(week)
    )

    return res.json({ ok: true, ...result })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})
