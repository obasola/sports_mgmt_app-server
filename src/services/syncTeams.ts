// src/services/syncTeams.ts
import { prisma as PrismaClient} from '../infrastructure/prisma';

import { EspnScoreboardClient } from '../infrastructure/scoreboardClient'
import { IJobLogger } from '../jobs/IJobLogger'

type SyncSummary = {
  matched: number
  updated: number
  created: number
  skipped: number
}

type EspnTeamLite = {
  id: string | number
  abbreviation?: string | null
  displayName?: string | null
  name?: string | null
  location?: string | null
}

export class SyncTeamsService {
  private prisma = PrismaClient

  constructor(
    private readonly client: EspnScoreboardClient,
    // keep param to preserve dependencies.ts DI signature
    _teamRepo: unknown,
    private readonly job: IJobLogger
  ) {}

  private norm(s?: string | null): string {
    return (s ?? '').trim()
  }

  /** Preferred (if your client ever adds it). */
  private async tryDirectTeams(): Promise<EspnTeamLite[] | null> {
    const c: any = this.client as any
    const candidates = ['getNflTeams', 'listTeams', 'getTeams', 'fetchTeams'] as const
    for (const fn of candidates) {
      if (typeof c[fn] === 'function') {
        const out = await (fn === 'listTeams' || fn === 'getTeams' || fn === 'fetchTeams'
          ? c[fn]('nfl')
          : c[fn]())
        if (Array.isArray(out) && out.length) return out
      }
    }
    return null
  }

  /** Fallback: harvest teams from a few scoreboards (pre/reg/post). */
  private async harvestFromScoreboard(): Promise<EspnTeamLite[]> {
    const c: any = this.client as any
    if (typeof c.getWeekScoreboard !== 'function') {
      throw new Error('EspnScoreboardClient has no getWeekScoreboard(seasonType, week)')
    }

    // Season types: 1=pre, 2=reg, 3=post
    // Weeks: usually week 1 contains all teams (especially regular season).
    const probes: Array<{ st: 1 | 2 | 3; wk: number }> = [
      { st: 2, wk: 1 }, // regular season week 1 (usually enough)
      { st: 1, wk: 1 }, // preseason week 1 (fallback)
      { st: 3, wk: 1 }, // postseason week 1 (fallback)
    ]

    const map = new Map<string, EspnTeamLite>() // key by espn id

    for (const { st, wk } of probes) {
      try {
        const sb = await c.getWeekScoreboard(st, wk)
        const events: any[] = Array.isArray(sb?.events) ? sb.events : []
        for (const ev of events) {
          const comps: any[] = Array.isArray(ev?.competitions) ? ev.competitions : []
          for (const comp of comps) {
            const compsArr: any[] = Array.isArray(comp?.competitors) ? comp.competitors : []
            for (const side of compsArr) {
              const team = side?.team
              if (!team) continue
              const id = team.id ?? team.uid ?? team.guid
              if (!id) continue
              const key = String(id)
              if (!map.has(key)) {
                map.set(key, {
                  id: key,
                  abbreviation: team.abbreviation ?? null,
                  displayName: team.displayName ?? team.shortDisplayName ?? null,
                  name: team.name ?? team.nickname ?? null,
                  location: team.location ?? team.city ?? null,
                })
              }
            }
          }
        }
      } catch {
        // ignore this probe, move on
      }
    }

    return Array.from(map.values())
  }

  private async fetchEspnTeams(): Promise<EspnTeamLite[]> {
    const direct = await this.tryDirectTeams()
    if (direct && direct.length) return direct
    const harvested = await this.harvestFromScoreboard()
    if (harvested.length) return harvested
    throw new Error(
      'Unable to obtain NFL teams from ESPN: no direct teams method and scoreboard harvest returned 0.'
    )
  }

  async run(): Promise<SyncSummary> {
    const { jobId } = await this.job.start({
      jobType: 'SYNC_TEAMS',
      params: {}
    })

    try {
      const espnTeams = await this.fetchEspnTeams()

      let matched = 0
      let updated = 0
      let created = 0
      let skipped = 0

      for (const t of espnTeams) {
        const espnId = Number(t.id)
        const abbrev = this.norm(t.abbreviation)?.toUpperCase() || null
        const displayName = this.norm(t.displayName)
        const nickname = this.norm(t.name)
        const location = this.norm(t.location)

        // 1) match by abbreviation (best)
        let local = abbrev
          ? await this.prisma.team.findFirst({
              where: { abbreviation: abbrev },
              select: { id: true, espnTeamId: true, abbreviation: true, name: true, city: true }
            })
          : null

        // 2) match by full display name (e.g., "Dallas Cowboys")
        if (!local && displayName) {
          local = await this.prisma.team.findFirst({
            where: { name: displayName },
            select: { id: true, espnTeamId: true, abbreviation: true, name: true, city: true }
          })
        }

        // 3) match by city + nickname (e.g., city="Dallas", name/nickname="Cowboys")
        if (!local && location && nickname) {
          local = await this.prisma.team.findFirst({
            where: { name: nickname, city: location },
            select: { id: true, espnTeamId: true, abbreviation: true, name: true, city: true }
          })
        }

        if (!local) {
          skipped++
          continue
        }

        matched++

        const needsEspn = local.espnTeamId == null || local.espnTeamId !== espnId
        const needsAbbrev = abbrev != null && (local.abbreviation == null || local.abbreviation.toUpperCase() !== abbrev)

        if (!needsEspn && !needsAbbrev) continue

        await this.prisma.team.update({
          where: { id: local.id },
          data: {
            espnTeamId: Number.isFinite(espnId) ? espnId : null,
            abbreviation: abbrev, // null allowed by Prisma model
          },
        })
        updated++

        if (matched % 8 === 0) {
          await this.job.log(jobId, {
            message: `Matched=${matched}, Updated=${updated}, Skipped=${skipped}`
          })
        }
      }

      await this.job.succeed(jobId, { matched, updated, created, skipped })
      return { matched, updated, created, skipped }
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? String(err))
      throw err
    }
  }
}
