// src/application/services/importers/nflSeason.ts
import axios from 'axios'
import { PrismaClient, Game } from '@prisma/client'
import { prisma } from '../../../infrastructure/prisma';

export type SeasonKind = 'pre' | 'reg' | 'post'
const SEASON_TYPE: Record<SeasonKind, number> = { pre: 1, reg: 2, post: 3 }

type ImportParams = {
  year: number
  seasons: SeasonKind[]
  maxWeeks?: number
  jobId?: number
}

type ImportResult = {
  inserted: number
  updated: number
  skipped: number
  failures: { reason: string; eventId?: string }[]
}

function mapEspnStatus(s: any): 'scheduled'|'in_progress'|'completed'|'postponed'|'canceled' {
  const code = s?.type?.state ?? s?.type?.name ?? ''
  if (/STATUS_IN_PROGRESS|in/i.test(code)) return 'in_progress'
  if (/STATUS_FINAL|final|complete/i.test(code)) return 'completed'
  if (/postpon/i.test(code)) return 'postponed'
  if (/cancel/i.test(code)) return 'canceled'
  return 'scheduled'
}

const norm = (s?: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

const log = async (jobId: number|undefined, level: 'info'|'warn'|'error', message: string) =>
  jobId ? prisma.jobLog.create({ data: { jobId, level, message } }) : undefined

/**
 * Resolve Team.id from ESPN team object using DB names.
 * Assumes Team.name matches ESPN `displayName` (e.g., "Kansas City Chiefs").
 * Fallback: `${location} ${shortDisplayName}` (e.g., "Kansas City Chiefs").
 */
function getTeamIdFromEspnTeam(espnTeam: any, teamByName: Map<string, number>): number | undefined {
  const candidates = [
    espnTeam?.displayName, // primary
    espnTeam?.name,        // often same as displayName
    espnTeam?.location && espnTeam?.shortDisplayName
      ? `${espnTeam.location} ${espnTeam.shortDisplayName}`
      : undefined,
  ]
  for (const c of candidates) {
    if (!c) continue
    const id = teamByName.get(norm(String(c)))
    if (id) return id
  }
  return undefined
}

function different(existing: Game, dto: Partial<Game>): boolean {
  // Compare only the fields you actually set in dto
  return (
    (existing.gameWeek ?? null) !== (dto.gameWeek ?? null) ||
    (existing.preseason ?? null) !== (dto.preseason ?? null) ||
    (existing.gameLocation ?? null) !== (dto.gameLocation ?? null) ||
    (existing.gameCity ?? null) !== (dto.gameCity ?? null) ||
    (existing.gameStateProvince ?? null) !== (dto.gameStateProvince ?? null) ||
    (existing.gameCountry ?? null) !== (dto.gameCountry ?? null) ||
    (existing.homeScore ?? 0) !== (dto.homeScore ?? 0) ||
    (existing.awayScore ?? 0) !== (dto.awayScore ?? 0) ||
    (existing.gameStatus as any) !== (dto.gameStatus as any)
  )
}


export async function importNflSeason(params: ImportParams): Promise<ImportResult> {
  const { year, seasons, maxWeeks = 25, jobId } = params

  // Load teams and verify completeness (we expect 32)
  const teams = await prisma.team.findMany({ select: { id: true, name: true } })
  if (teams.length !== 32) {
    const msg = `Team table incomplete (${teams.length}/32). Import aborted.`
    await log(jobId, 'error', msg)
    throw new Error(msg)
  }

  // Build case-insensitive name → id map
  const teamByName = new Map(teams.map(t => [norm(t.name), t.id]))

  let inserted = 0, updated = 0, skipped = 0
  const failures: ImportResult['failures'] = []

  for (const sk of seasons) {
    const st = SEASON_TYPE[sk]
    let week = 1, emptyStreak = 0
    await log(jobId, 'info', `Begin seasonType=${st} (${sk})`)

    while (week <= maxWeeks) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${year}&seasontype=${st}&week=${week}`
      await log(jobId, 'info', `Fetch week ${week}: ${url}`)

      let events: any[] = []
      try {
        const { data } = await axios.get(url, { timeout: 15000 })
        events = data?.events ?? []
      } catch (e: any) {
        await log(jobId, 'warn', `Week ${week} fetch failed: ${e?.message ?? e}`)
        failures.push({ reason: `fetch_failed_week_${week}` })
        week++
        continue
      }

      if (events.length === 0) {
        if (++emptyStreak >= 2) {
          await log(jobId, 'info', `No events for two weeks, stopping seasontype=${st}`)
          break
        }
        week++
        continue
      }
      emptyStreak = 0

      for (const ev of events) {
        try {
          const comp = ev?.competitions?.[0]
          const dateIso = ev?.date || comp?.date
          const status = mapEspnStatus(ev?.status ?? comp?.status)
          const venue = comp?.venue
          const addr = venue?.address ?? {}
          const competitors = comp?.competitors ?? []
          const home = competitors.find((c: any) => c?.homeAway === 'home')?.team
          const away = competitors.find((c: any) => c?.homeAway === 'away')?.team

          if (!home?.displayName || !away?.displayName || !dateIso) {
            skipped++
            continue
          }

          const homeTeamId = getTeamIdFromEspnTeam(home, teamByName)
          const awayTeamId = getTeamIdFromEspnTeam(away, teamByName)

          if (!homeTeamId || !awayTeamId) {
            failures.push({ reason: 'team_not_found', eventId: ev?.id })
            await log(jobId, 'error',
              `Team not found: home="${home?.displayName}" (${home?.location}/${home?.shortDisplayName}) ` +
              `away="${away?.displayName}" (${away?.location}/${away?.shortDisplayName})`)
            continue
          }

          const gameDate = new Date(dateIso)
          const where = {
            seasonYear_gameDate_homeTeamId_awayTeamId: {
              seasonYear: String(year), gameDate, homeTeamId, awayTeamId
            }
          }
          const existing = await prisma.game.findUnique({ where })

          const dto = {
            seasonYear: String(year),
            gameWeek: ev?.week?.number ?? comp?.week?.number ?? null,
            preseason: st === 1 ? 1 : 0,
            gameDate,
            homeTeamId, awayTeamId,
            gameLocation: venue?.fullName ?? null,
            gameCity: addr?.city ?? null,
            gameStateProvince: addr?.state ?? null,
            gameCountry: (addr?.country ?? 'USA') || 'USA',
            homeScore: Number(competitors.find((c: any)=>c.homeAway==='home')?.score ?? 0) || 0,
            awayScore: Number(competitors.find((c: any)=>c.homeAway==='away')?.score ?? 0) || 0,
            gameStatus: status as any,
          }

          if (!existing) {
            await prisma.game.create({ data: dto })
            inserted++
          } else {
            if (different(existing, dto as any)) {
              await prisma.game.update({ where, data: { ...dto, updatedAt: new Date() } })
              updated++
            } else {
              skipped++
            }
          }
        } catch (err: any) {
          failures.push({ reason: `event_error_${ev?.id ?? 'unknown'}` })
          await log(jobId, 'error', `Event error: ${err?.message ?? String(err)}`)
        }
      }
      week++
    }
  }

  return { inserted, updated, skipped, failures }
}
