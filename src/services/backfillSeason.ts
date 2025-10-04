// src/services/backfillSeason.ts
import { EspnScoreboardClient, SeasonType } from "../infrastructure/scoreboardClient";
import { IGameRepository } from "../domain/game/repositories/IGameRepository";
import { IJobLogger } from "../jobs/IJobLogger";

type RunArgs   = { year: number; seasonType: SeasonType }
type RunResult = { processed: number; failed: number; weeks: number[] }

export class BackfillSeasonService {
  constructor(
    private readonly espn: EspnScoreboardClient,
    private readonly gameRepo: IGameRepository,
    private readonly job: IJobLogger
  ) {}

  async run({ year, seasonType }: RunArgs): Promise<RunResult> {
    const { jobId } = await this.job.start({
      jobType: 'IMPORT_NFL_SEASON',
      params: { year, seasonType }
    })

    try {
      await this.job.log(jobId, { message: `Starting backfill: year=${year}, seasonType=${seasonType}` })

      const weekMax = seasonType === 1 ? 5 : (seasonType === 2 ? 18 : 4)
      let processed = 0
      let failed = 0
      const weeks: number[] = []

      for (let week = 1; week <= weekMax; week++) {
        try {
          const r = await this.importWeek({ year, seasonType, week, jobId })
          processed += r.processed
          failed += r.failed
          weeks.push(week)
          await this.job.log(jobId, { message: `Week ${week}: processed=${r.processed}, failed=${r.failed}` })
        } catch (err: any) {
          failed++
          await this.job.log(jobId, { message: `Week ${week} failed: ${err?.message ?? String(err)}` })
        }
      }

      await this.job.succeed(jobId, { year, seasonType, processed, failed, weeks })
      return { processed, failed, weeks }
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? String(err))
      throw err
    }
  }

  private async importWeek(
    { year, seasonType, week, jobId }: { year: number; seasonType: SeasonType; week: number; jobId: number }
  ): Promise<{ processed: number; failed: number }> {
    // ESPN client API you showed earlier
    const sb = await this.espn.getWeek({ year, seasonType, week })

    const events = sb?.events ?? []

    const seasonYear = String(sb?.season?.year ?? year)
    const sbSeasonType = (sb?.season?.type ?? seasonType) as SeasonType
    const weekForDb = sbSeasonType === 1 ? 0 : week;

    const legacyType = sbSeasonType === 1 ? 1 : 0
    let processed = 0
    let failed = 0

    for (const event of events) {
      const comp = event?.competitions?.[0]
      if (!comp) continue

      try {
        const { homeTeamId, awayTeamId, payload } = await this.mapCompetition({
          event,
          comp,
          seasonYear,
          seasonType: sbSeasonType,
          week: weekForDb,   // <-- pass coerced week
        })

        // IMPORTANT: Pass **local Team.id** in both key and payload
        await this.gameRepo.upsertByKey(
          {
            espnCompetitionId: comp.id,
            espnEventId: event.id,
            seasonYear,
            preseason: (sbSeasonType === 1 ? 1 : 0) as unknown as SeasonType, // cast 0/1 to SeasonType to satisfy types
            gameWeek: weekForDb,
            homeTeamId,
            awayTeamId,
          },
          payload
        )
        processed++
      } catch (err: any) {
        failed++
        const msg = `Upsert failed for event=${event?.id}, comp=${comp?.id}: ${err?.message ?? String(err)}`
        await this.job.log(jobId, {message: msg})
        console.error("❌", msg)  
      }
    }

    return { processed, failed }
  }

  private async mapCompetition(args: {
    event: any
    comp: any
    seasonYear: string
    seasonType: SeasonType
    week: number
  }): Promise<{
    homeTeamId: number
    awayTeamId: number
    payload: {
      readonly seasonYear: string
      readonly gameWeek: number
      readonly preseason: SeasonType
      readonly seasonType: SeasonType | null
      readonly gameDate: Date | null
      readonly homeTeamId: number
      readonly awayTeamId: number
      readonly homeScore: number | null
      readonly awayScore: number | null
      readonly gameStatus: string | null
      readonly gameLocation: string | null
      readonly gameCity: string | null
      readonly gameStateProvince: string | null
      readonly gameCountry: string | null
      readonly espnEventId: string
      readonly espnCompetitionId: string
    }
  }> {
    const { event, comp, seasonYear, seasonType, week } = args

    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home')
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away')
    if (!home || !away) throw new Error('Missing competitors')

    // Resolve LOCAL Team ids (Team.id in your DB)
    const [homeLocal, awayLocal] = await Promise.all([
      this.resolveLocalTeamId(home?.team?.id, home?.team?.abbreviation),
      this.resolveLocalTeamId(away?.team?.id, away?.team?.abbreviation),
    ])

    const statusName = String(comp?.status?.type?.name ?? 'STATUS_SCHEDULED').toLowerCase()
    const gameStatus =
      statusName.includes('final')     ? 'completed'   :
      statusName.includes('in')        ? 'in_progress' :
      statusName.includes('post')      ? 'postponed'   :
      statusName.includes('cancel')    ? 'canceled'    :
                                         'scheduled'

    // CRITICAL: use the **local** ids in the payload as well
    const payload = {
      seasonYear,
      gameWeek: week,
      preseason: (seasonType === 1 ? 1 : 0) as unknown as SeasonType, // cast to match IGameRepository type

      seasonType: seasonType ?? null,   // if your schema has this
      gameDate: comp?.date ? new Date(comp.date) : null,

      homeTeamId: homeLocal,
      awayTeamId: awayLocal,
      homeScore: home?.score != null ? Number(home.score) : null,
      awayScore: away?.score != null ? Number(away.score) : null,

      gameStatus,
      gameLocation: comp?.venue?.fullName ?? null,
      gameCity: comp?.venue?.address?.city ?? null,
      gameStateProvince: comp?.venue?.address?.state ?? null,
      gameCountry: comp?.venue?.address?.country ?? 'USA',

      espnEventId: String(event?.id ?? ''),
      espnCompetitionId: String(comp?.id ?? ''),
    } as const

    return { homeTeamId: homeLocal, awayTeamId: awayLocal, payload }
  }

  /** Resolve to a definite local Team.id (number) or throw a helpful error */
  private async resolveLocalTeamId(espnIdLike: unknown, abbrevLike: unknown): Promise<number> {
    const espnIdStr =
      typeof espnIdLike === 'number' || typeof espnIdLike === 'string'
        ? String(espnIdLike)
        : ''
    const abbrevStr = typeof abbrevLike === 'string' ? abbrevLike : ''

    // Try ESPN id first
    let found: unknown = null
    if (espnIdStr) {
      found = await this.gameRepo.findTeamIdByEspnTeamId(espnIdStr)
    }
    // Fallback to abbreviation
    if ((found == null || typeof found !== 'number') && abbrevStr) {
      found = await this.gameRepo.findTeamIdByAbbrev(abbrevStr)
    }

    if (typeof found !== 'number') {
      throw new Error(
        `Team map missing (espnId=${espnIdStr || '∅'}, abbr=${abbrevStr || '∅'})`
      )
    }
    return found
  }
}
