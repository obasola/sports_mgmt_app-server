
// src/services/importNflScores.ts

import { SyncWeekEventsService } from '@/application/schedule/services/SyncWeekEventsService'
import { ScoreboardSyncService } from '@/application/scoreboard/services/ScoreboardSyncService'

export async function syncScheduleFromEvents(
  year: number,
  seasonType: number,
  week: number,
  deps: {
    syncEvents: SyncWeekEventsService
  }
) {
  return deps.syncEvents.sync(year, seasonType, week)
}

export async function syncScoresFromScoreboard(
  year: number,
  seasonType: number,
  week: number,
  deps: {
    scoreboard: ScoreboardSyncService
  }
) {
  const st = Number(seasonType);
  if (st !== 1 && st !== 2 && st !== 3) {
    throw new Error(`Invalid seasonType ${seasonType}`);
  }
  return deps.scoreboard.runWeek({
    seasonYear: String(year),
    seasonType: st,
    week,
  })
}

// For jobs: run schedule first, then scores
export async function importNflScoresAndSchedule(
  year: number,
  seasonType: number,
  week: number,
  deps: {
    syncEvents: SyncWeekEventsService
    scoreboard: ScoreboardSyncService
  }
) {
  await syncScheduleFromEvents(year, seasonType, week, deps)
  return syncScoresFromScoreboard(year, seasonType, week, deps)
}
