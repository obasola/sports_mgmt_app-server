// src/services/importNflScores.ts
import {
  EspnScoreboardClient,
  SeasonType,
  EspnEvent,
  EspnCompetition,
} from "../infrastructure/scoreboardClient";
import { IGameRepository } from "../domain/game/repositories/IGameRepository";
import { IJobLogger } from "../jobs/IJobLogger";

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
  async run(params: { seasonYear: string, seasonType: SeasonType; week: number }): Promise<{
    seasonYear: string;
    seasonType: SeasonType;
    week: number;
    totalEvents: number;
    upserts: number;
    skipped: number;
  }> {
    const { seasonYear, seasonType, week } = params;

    const { jobId } = await this.job.start({
      jobType: "IMPORT_SCORES_WEEK",
      params: { seasonYear, seasonType, week },
    });

    try {
      const sb = await this.client.getWeekScoreboard(seasonYear, seasonType, week);
      //const seasonYear = String(sb?.season?.year ?? "");
      const events = sb.events ?? [];

      let upserts = 0;
      let skipped = 0;

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        for (const comp of event.competitions ?? []) {
          const ok = await this.importCompetition(
            event,
            comp,
            seasonType,
            seasonYear,
            week
          );
          ok ? upserts++ : skipped++;
        }
        if ((i + 1) % 4 === 0) {
          await this.job.log(jobId, {
            message: `Processed ${i + 1}/${events.length} events...`,
          });
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
      };
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? "Import week failed", {
        seasonType,
        week,
      });
      throw err;
    }
  }

  /** Optional: some callers prefer an explicit year param. */
  async importWeek(params: {
    seasonYear: string;
    seasonType: SeasonType;
    week: number;
  }) {
    // ESPN per-week scoreboard doesn’t need year to fetch,
    // but we still return the computed seasonYear from ESPN to confirm.
    return this.run({ seasonYear: params.seasonYear, seasonType: params.seasonType, week: params.week });
  }

  // ------------ internals ------------

   private async importCompetition(
    event: EspnEvent,
    comp: EspnCompetition,
    seasonType: SeasonType,
    seasonYear: string,
    week: number,
    jobId?: number
  ): Promise<boolean> {
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
    if (!home || !away) {
      await this.job.log?.(jobId === undefined ? 0 : jobId, { message: `Skip event=${event.id}: missing home/away` });
      return false;
    }

    // Explicitly narrow unknown -> number|null
    const homeIdFromEspn = (await this.repo.findTeamIdByEspnTeamId(home.team.id)) as number | null;
    const homeIdFromAbbr =
      home.team.abbreviation != null
        ? ((await this.repo.findTeamIdByAbbrev(home.team.abbreviation)) as number | null)
        : null;
    const homeId = homeIdFromEspn ?? homeIdFromAbbr;

    const awayIdFromEspn = (await this.repo.findTeamIdByEspnTeamId(away.team.id)) as number | null;
    const awayIdFromAbbr =
      away.team.abbreviation != null
        ? ((await this.repo.findTeamIdByAbbrev(away.team.abbreviation)) as number | null)
        : null;
    const awayId = awayIdFromEspn ?? awayIdFromAbbr;

    if (homeId == null || awayId == null) {
      await this.job.log?.(jobId === undefined ? 0 : jobId, {
        message: `Skip (team mapping missing) event=${event.id} comp=${comp.id} home=${home.team.id}/${home.team.abbreviation} away=${away.team.id}/${away.team.abbreviation}`,
      });
      return false;
    }

    // After the null-guard, make TS happy with concrete numbers
    const homeIdNum: number = homeId;
    const awayIdNum: number = awayId;

    // Normalize ESPN status -> your enum
    const rawName = comp.status?.type?.name?.toLowerCase() ?? "";
    const rawState = comp.status?.type?.state?.toLowerCase() ?? "";
    const completed = !!comp.status?.type?.completed;
    const gameStatus:
      | "scheduled"
      | "in_progress"
      | "completed"
      | "postponed"
      | "canceled" =
      completed || rawName === "status_final" || rawName.includes("final")
        ? "completed"
        : rawState.includes("in") || rawName.includes("in")
        ? "in_progress"
        : rawName.includes("post") || rawState.includes("post")
        ? "postponed"
        : rawName.includes("cancel") || rawState.includes("cancel")
        ? "canceled"
        : "scheduled";

    await this.repo.upsertByKey(
      {
        espnCompetitionId: comp.id,
        espnEventId: event.id,
        seasonYear,
        preseason: seasonType,
        gameWeek: week,
        homeTeamId: homeIdNum,   // <- concrete number
        awayTeamId: awayIdNum,   // <- concrete number
      },
      {
        seasonYear,
        gameWeek: week,
        preseason: seasonType,
        gameDate: comp.date ? new Date(comp.date) : null,
        homeTeamId: homeIdNum,   // <- concrete number
        awayTeamId: awayIdNum,   // <- concrete number
        homeScore: home.score != null ? Number(home.score) : null,
        awayScore: away.score != null ? Number(away.score) : null,
        gameStatus,
        espnEventId: event.id,
        espnCompetitionId: comp.id,
        // Optional venue fields if your schema supports them:
        // gameLocation: comp.venue?.fullName ?? null,
        // gameCity: comp.venue?.address?.city ?? null,
        // gameStateProvince: comp.venue?.address?.state ?? null,
        // gameCountry: comp.venue?.address?.country ?? 'USA',
      }
    );

    return true;
  }


}
