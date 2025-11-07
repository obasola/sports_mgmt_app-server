import { fetchScoreboard, SeasonType } from '@/infrastructure/espn/scoreboardClient';
import { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';

export interface ScoreboardSyncResult {
  processed: number;
  failed: number;
  seasonYear: number;
  seasonType: SeasonType;
  week: number;
}

export class ScoreboardSyncService {
  private prisma: PrismaClient;
  private games: PrismaGameRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.games = new PrismaGameRepository(this.prisma);
  }

  /** Sync one NFL week from ESPN into MyNFL.Game */
  async runWeek(params: { seasonYear: string; seasonType: SeasonType; week: number }) {
    const { seasonYear, seasonType, week } = params;
    console.log(`🏈 Syncing scoreboard for ${seasonYear} type ${seasonType} week ${week}`);

    const data = await fetchScoreboard({
      year: Number(seasonYear),
      seasonType,
      week,
    });

    for (const ev of data.events ?? []) {
      try {
        const key = {
          espnCompetitionId: ev.id,
          espnEventId: ev.id,
          seasonYear,
          seasonType,
          gameWeek: week,
          homeTeamId: ev.homeTeamId,
          awayTeamId: ev.awayTeamId,
        };

        const gameData = {
          seasonYear,
          seasonType,
          gameWeek: week,
          gameDate: new Date(ev.date),
          homeTeamId: ev.homeTeamId,
          awayTeamId: ev.awayTeamId,
          homeScore: ev.homeScore ?? null,
          awayScore: ev.awayScore ?? null,
          gameStatus: ev.status ?? 'scheduled',
          espnEventId: ev.id,
          espnCompetitionId: ev.id,
        };

        await this.games.upsertByKey(key, gameData);
      } catch (err) {
        console.error(`❌ Error syncing event ${ev.id}:`, err);
      }
    }

    return {
      seasonYear,
      seasonType,
      week,
      processed: (data.events ?? []).length,
      failed: 0, // update if you track failures
    };
  }
 

  async dispose() {
    await this.prisma.$disconnect();
  }
}
