// src/application/scoreboard/services/ScoreboardSyncService.ts

import { fetchScoreboard, SeasonType } from '@/infrastructure/espn/scoreboardClient';
import { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { Game_gameStatus } from '@prisma/client'; // adjust path if needed

export interface ScoreboardSyncResult {
  processed: number;
  failed: number;
  seasonYear: number | string;
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

  private normalizeSeasonYear(value: any): string {
    const yearNum = Number(value);
    if (Number.isInteger(yearNum) && yearNum >= 1900 && yearNum <= 3000) {
      return String(yearNum);
    }
    return String(new Date().getFullYear());
  }

  private normalizeStatus(status: any): string {
    if (!status) return 'scheduled';
    const s = String(status).toUpperCase();
    if (s.includes('FINAL')) return 'final';
    if (s.includes('IN_PROGRESS')) return 'in_progress';
    if (s.includes('POSTPONED')) return 'postponed';
    if (s.includes('CANCELED')) return 'canceled';
    if (s.includes('DELAYED')) return 'in_progress';
    return 'scheduled';
  }

  /**
   * ⭐ Option C Logic:
   * - Scoreboard updates scores + status ONLY.
   * - Games MUST ALREADY EXIST (from Event Sync).
   */
  async runWeek(params: { seasonYear: string; seasonType: SeasonType; week: number }) {
    const { seasonYear, seasonType, week } = params;
    const normalizedYear = this.normalizeSeasonYear(seasonYear);

    console.log(
      `🏈 [ScoreboardSync] Updating scores for ${normalizedYear} type ${seasonType} week ${week}`
    );

    const data = await fetchScoreboard({
      year: Number(normalizedYear),
      seasonType,
      week,
    });

    let processed = 0;
    let failed = 0;

    for (const ev of data.events ?? []) {
      try {
        const compId = String(ev.id);
        const existing = await this.games.findByEspnCompetitionId(compId);

        if (!existing) {
          console.warn(
            `⚠️ [ScoreboardSync] Skipping competition=${compId}.` +
              ` No DB row exists — expected Event Sync to create it.`
          );
          continue;
        }

        const status = this.normalizeStatus(ev.status?.type?.name ?? ev.status);

        // Update only scoreboard-controlled fields
        const updateData = {
          gameStatus: this.toPrismaStatus(status),
          homeScore: ev.homeScore ?? null,
          awayScore: ev.awayScore ?? null,
          gameDate: ev.date ? new Date(ev.date) : existing.gameDate,
        };
        if (existing && existing.id) {
          await this.games.updatePartial(existing.id, updateData);
          processed++;
        }
      } catch (err) {
        failed++;
        console.error(`❌ [ScoreboardSync] Error processing event ${ev.id}:`, err);
      }
    }

    return {
      seasonYear: normalizedYear,
      seasonType,
      week,
      processed,
      failed,
    };
  }

  /**
   * Same logic for date-based sync:
   * - NO creation
   * - Update scores only
   */
  async runDate(params: { date: string }) {
    const { date } = params;
    console.log(`🏈 [ScoreboardSync] Updating scores for date ${date}`);

    if (!/^\d{8}$/.test(date)) {
      throw new Error(`Invalid date format "${date}". Expected YYYYMMDD.`);
    }

    const data = await fetchScoreboard({ date });
    let processed = 0;
    let failed = 0;

    for (const ev of data.events ?? []) {
      try {
        const compId = String(ev.id);
        console.log(`🏈 [ScoreboardSync] processing compId ${compId}`);

        const existing = await this.games.findByEspnCompetitionId(compId);

        if (!existing) {
          console.warn(`⚠️ [ScoreboardSync] Skipping competition=${compId}. No DB row exists.`);
          continue;
        }
        console.log(`🏈 [ScoreboardSync] normalizing event status ${ev.status}`);
        const status = this.normalizeStatus(ev.status?.type?.name ?? ev.status);
        console.log(`🏈 [ScoreboardSync] (UPDATE data) Date: ${ev.date} homeScore: ${ev.homeScore} awayScore: ${ev.awayScore} gameStatus: ${ev.status} `);
        console.log(`🏈 [ScoreboardSync] existing true but existing.id = ${existing.id}`);
        console.log(`🏈 [ScoreboardSync] (existing) awayTeamId = ${existing.awayTeamId} homeTeamId = ${existing.homeTeamId} `);

        const updateData = {
          gameStatus: this.toPrismaStatus(status),
          homeScore: ev.homeScore ?? null,
          awayScore: ev.awayScore ?? null,
          gameDate: ev.date ? new Date(ev.date) : existing.gameDate,
        };

        if (existing && existing.id) {
          console.log(`🏈 [ScoreboardSync] do partial update: HomeScore = ${updateData.homeScore} AwayScore = ${updateData.awayScore}`);
          await this.games.updatePartial(existing.id, updateData);
          processed++;
        }else{
          console.log(`🏈 [ScoreboardSync] Nothing to Update for Date: ${date}`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ [ScoreboardSync] Error processing event ${ev.id}:`, err);
      }
    }

    return { date, processed, failed };
  }

  private toPrismaStatus(status: string): Game_gameStatus {
    const s = status.toLowerCase();

    if (s.includes('final')) return Game_gameStatus.final;
    if (s.includes('in_progress')) return Game_gameStatus.in_progress;
    if (s.includes('postponed')) return Game_gameStatus.postponed;
    if (s.includes('canceled')) return Game_gameStatus.canceled;

    // default:
    return Game_gameStatus.scheduled;
  }

  async dispose() {
    await this.prisma.$disconnect();
  }
}
