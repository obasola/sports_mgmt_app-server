// src/services/importNflScores.ts
import {
  EspnScoreboardClient,
  SeasonType,
  EspnEvent,
  EspnCompetition,
} from '../infrastructure/scoreboardClient';
import { IGameRepository } from '../domain/game/repositories/IGameRepository';
import { IJobLogger } from '../jobs/IJobLogger';

/**
 * Imports a single week (by seasonType + week) from ESPN Scoreboard API
 * and upserts into Game table. Idempotent via espnCompetitionId.
 */
export class ImportNflScoresService {
  constructor(
    private readonly client: EspnScoreboardClient,
    private readonly repo: IGameRepository,
    private readonly job: IJobLogger
  ) {}

  /** Primary entry used by codebase (what your callers were missing). */
  async run(params: { seasonYear: string; seasonType: SeasonType; week: number }): Promise<{
    seasonYear: string;
    seasonType: SeasonType;
    week: number;
    totalEvents: number;
    upserts: number;
    skipped: number;
    scoreChanges: { homeTeam: string; homeScore: number; awayTeam: string; awayScore: number }[];
  }> {
    const { seasonYear, seasonType, week } = params;
    const { jobId } = await this.job.start({
      jobType: 'IMPORT_SCORES_WEEK',
      params: { seasonYear, seasonType, week },
    });

    try {
      const sb = await this.client.getWeekScoreboard(seasonYear, seasonType, week);
      const events = sb.events ?? [];

      let upserts = 0;
      let skipped = 0;
      const scoreChanges: {
        homeTeam: string;
        homeScore: number;
        awayTeam: string;
        awayScore: number;
      }[] = [];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        for (const comp of event.competitions ?? []) {
          console.log('===================================');
          console.log('(src/services/importNflScores.ts) Year: ' + seasonYear);
          console.log('===================================');
          const result = await this.importCompetition(event, comp, seasonType, seasonYear, week);
          if (result.ok) {
            upserts++;
            if (result.scoreChanged) {
              scoreChanges.push({
                homeTeam: result.homeName ? result.homeName : '',
                homeScore: result.homeScore ? result.homeScore : 0,
                awayTeam: result.awayName ? result.awayName : '',
                awayScore: result.awayScore ? result.awayScore : 0,
              });
              // now log results
              if (scoreChanges.length) {
                await this.job.log(jobId, {
                  // level: 'info',
                  message: `Score changes: ${scoreChanges
                    .map((g) => `${g.homeTeam} ${g.homeScore}-${g.awayScore} ${g.awayTeam}`)
                    .join('; ')}`,
                });
              }
            }
          } else {
            skipped++;
          }
        }
      }

      await this.job.succeed(jobId, {
        seasonYear,
        seasonType,
        week,
        totalEvents: events.length,
        upserts,
        skipped,
      });
      return {
        seasonYear,
        seasonType,
        week,
        totalEvents: events.length,
        upserts,
        skipped,
        scoreChanges,
      };
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? 'Import week failed', { seasonType, week });
      throw err;
    }
  }

  /** Optional: some callers prefer an explicit year param. */
  async importWeek(params: { seasonYear: string; seasonType: SeasonType; week: number }) {
    // ESPN per-week scoreboard doesn’t need year to fetch,
    // but we still return the computed seasonYear from ESPN to confirm.
    return this.run({
      seasonYear: params.seasonYear,
      seasonType: params.seasonType,
      week: params.week,
    });
  }

  // ------------ internals ------------

  private async importCompetition(
    event: EspnEvent,
    comp: EspnCompetition,
    seasonType: SeasonType,
    seasonYear: string,
    week: number,
    jobId?: number
  ): Promise<{
    ok: boolean;
    scoreChanged?: boolean | null;
    homeName?: string;
    homeScore?: number;
    awayName?: string;
    awayScore?: number;
  }> {
    const home = comp.competitors.find((c) => c.homeAway === 'home');
    const away = comp.competitors.find((c) => c.homeAway === 'away');
    if (!home || !away) return { ok: false };

    const homeId =
      (await this.repo.findTeamIdByEspnTeamId(home.team.id)) ??
      (await this.repo.findTeamIdByAbbrev(home.team.abbreviation));
    const awayId =
      (await this.repo.findTeamIdByEspnTeamId(away.team.id)) ??
      (await this.repo.findTeamIdByAbbrev(away.team.abbreviation));
    if (!homeId || !awayId) return { ok: false };

    const newHomeScore = home.score ? Number(home.score) : null;
    const newAwayScore = away.score ? Number(away.score) : null;

    // Retrieve previous scores (if any)
    const prev = await this.repo.findByEspnCompetitionId(comp.id);
    const scoreChanged =
      prev && (prev.homeScore !== newHomeScore || prev.awayScore !== newAwayScore);

    if (!homeId || !awayId) {
      console.warn(
        `⚠️ Skipping ${comp.id} — missing team mapping. home=${home?.team?.abbreviation}, away=${away?.team?.abbreviation}`
      );
      return { ok: false };
    }

    await this.repo.upsertByKey(
      {
        espnCompetitionId: comp.id,
        espnEventId: event.id,
        seasonYear,
        seasonType: seasonType,
        gameWeek: week,
        homeTeamId: homeId,
        awayTeamId: awayId,
      },
      {
        seasonYear,
        gameWeek: week,
        seasonType: seasonType,
        gameDate: comp.date ? new Date(comp.date) : null,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        gameStatus: comp.status?.type?.completed ? 'completed' : 'scheduled',
        espnEventId: event.id,
        espnCompetitionId: comp.id,
      }
    );

    return {
      ok: true,
      scoreChanged,
      homeName: home.team.displayName,
      homeScore: newHomeScore ?? 0,
      awayName: away.team.displayName,
      awayScore: newAwayScore ?? 0,
    };
  }
}
