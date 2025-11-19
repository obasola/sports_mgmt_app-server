// src/services/ScoreboardScheduleService.ts
/*
This file is not the actual Scoreboard sync logic.
This is the UI-configurable cron schedule for when the scoreboard sync job should run.

The real scoreboard logic lives in:
src/application/scoreboard/services/ScoreboardSyncService.ts
*/
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { ScoreboardSchedule, Day } from '@/types/scoreboardSchedule'

const KEY = 'scoreboard.schedule'
// src/services/ScoreboardScheduleService.ts
const DEFAULT: ScoreboardSchedule = {
  enabled: true,
  days: ['SUN','MON','THU','SAT'],
  hour: 0,
  minute: 0,
  timezone: 'America/Chicago',
  mode: 'by-week',
  seasonYear: '2025',
  seasonType: 2, // regular
  week: 1,
}


function isDay(x: string): x is Day {
  return ['SUN','MON','TUE','WED','THU','FRI','SAT'].includes(x)
}

export function validateSchedule(s: any): asserts s is ScoreboardSchedule {
  if (typeof s !== 'object' || s == null) throw new Error('Invalid payload')
  if (typeof s.enabled !== 'boolean') throw new Error('enabled must be boolean')
  if (!Array.isArray(s.days) || !s.days.every((d: any) => typeof d === 'string' && isDay(d))) {
    throw new Error('days must be array of day codes')
  }
  if (typeof s.hour !== 'number' || s.hour < 0 || s.hour > 23) throw new Error('hour 0..23')
  if (typeof s.minute !== 'number' || s.minute < 0 || s.minute > 59) throw new Error('minute 0..59')
  if (typeof s.timezone !== 'string' || !s.timezone) throw new Error('timezone required')
  if (s.mode && s.mode !== 'by-date') throw new Error('unsupported mode')
}

export async function getSchedule(): Promise<ScoreboardSchedule> {
  const row = await prisma.appSetting.findUnique({ where: { key: KEY } })
  if (!row) return DEFAULT
  try {
    const merged = { ...DEFAULT, ...(row.value as object) }
    validateSchedule(merged)
    return merged
  } catch {
    return DEFAULT
  }
}

const toJsonValue = (o: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(o)) as Prisma.InputJsonValue

export async function saveSchedule(s: ScoreboardSchedule): Promise<ScoreboardSchedule> {
  validateSchedule(s)
  
  await prisma.appSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: toJsonValue(s) },
    update: { value: toJsonValue(s) },
  })
  return s
}
