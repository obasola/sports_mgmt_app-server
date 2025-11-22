// src/infrastructure/espn/EspnScheduleClient.ts

import axios from 'axios';
import { resolveTeamLogo } from '@/utils/resolveTeamLogo';
import { TEAM_COLOR_MAP } from '@/utils/TEAM_COLOR_MAP';

import { NormalizedGameDTO, WeekScheduleDTO } from '@/utils/schedule/scheduleTypes';

import { formatDate, derivePrimetime } from '@/utils/schedule/dateHelpers';
import { normalizeStatus } from '@/utils/schedule/scheduleNormalizer';
import type { GameStatus } from '@/utils/schedule/scheduleTypes';
export class EspnScheduleClient {
  async getWeekEvents(year: number, seasonType: number, week: number): Promise<WeekScheduleDTO> {
    const listUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/types/${seasonType}/weeks/${week}/events`;
    const { data } = await axios.get(listUrl);
    const items = data.items ?? [];

    const normalizedEvents = await Promise.all(
      items.map(async (item: any) => {
        try {
          const match = item.$ref?.match(/\/events\/(\d+)/);
          const eventId = match ? Number(match[1]) : null;
          if (!eventId) return null;

          // Fetch event root
          const eventRes = await axios.get(item.$ref);
          const e = eventRes.data;

          const competitions = Array.isArray(e.competitions) ? e.competitions : [];
          const comp = competitions[0];

          if (!comp || !Array.isArray(comp.competitors)) {
            console.warn(`⚠️ Event ${eventId} missing competitor info`);
            return null;
          }

          // Competitors
          const competitors = comp.competitors;

          const homeRaw = competitors.find((c: any) => c.homeAway === 'home');
          const awayRaw = competitors.find((c: any) => c.homeAway === 'away');

          if (!homeRaw || !awayRaw) {
            console.warn(`⚠️ Event ${eventId} missing home/away structure`);
            return null;
          }

          // Fetch team objects
          const homeTeamObj = await this.fetchRefObject(homeRaw.team?.$ref);
          const awayTeamObj = await this.fetchRefObject(awayRaw.team?.$ref);

          const homeTeamName =
            homeTeamObj?.displayName || homeTeamObj?.shortDisplayName || homeTeamObj?.name || 'TBD';

          const awayTeamName =
            awayTeamObj?.displayName || awayTeamObj?.shortDisplayName || awayTeamObj?.name || 'TBD';

          // ESPN logos
          const homeLogoEspn = homeTeamObj?.logos?.[0]?.href ?? null;
          const awayLogoEspn = awayTeamObj?.logos?.[0]?.href ?? null;

          // Local logos
          const homeLogoLocal = resolveTeamLogo(homeTeamName);
          const awayLogoLocal = resolveTeamLogo(awayTeamName);

          // Scores
          const homeScoreObj = await this.fetchRefObject(homeRaw.score?.$ref);
          const awayScoreObj = await this.fetchRefObject(awayRaw.score?.$ref);

          const homeScore = typeof homeScoreObj?.value === 'number' ? homeScoreObj.value : null;

          const awayScore = typeof awayScoreObj?.value === 'number' ? awayScoreObj.value : null;

          // Winner flags
          const homeWinner = homeRaw?.winner === true;
          const awayWinner = awayRaw?.winner === true;

          // Status
          const rawStatus =
          comp?.status?.type?.shortDetail ||
          comp?.status?.type?.detail ||
          comp?.status?.type?.description ||
          e.status?.type?.name ||
          "Scheduled";

          let statusNormalized: GameStatus;

          //---------------- Start status Normalization ------------------------------
          // Intelligent scoring-aware override logic:
        

          if ((this.gameHasScores(homeScore) || this.gameHasScores(awayScore) ) && (homeWinner || awayWinner)) {
            statusNormalized = 'Final';
          } else if ((this.gameHasScores(homeScore) || this.gameHasScores(awayScore) ) ) {
            statusNormalized = 'In Progress';
          } else {
            statusNormalized = normalizeStatus(rawStatus); // already returns GameStatus
          }
          // ALWAYS sync statusDetail to normalized status
          const statDetail = statusNormalized;
          //---------------- End status Normalization ------------------------------
          // Date
          const date = comp?.date || e.date || item?.date || null;

          const dateFormatted = formatDate(date);

          // Primetime
          const { isPrimetime, primetimeType } = derivePrimetime(date);

          const game: NormalizedGameDTO = {
            id: eventId,

            date,
            dateFormatted,

            homeTeamId: Number(homeTeamObj?.id) || null,
            homeTeamName,
            homeLogoLocal,
            homeLogoEspn,
            homeScore,
            homeWinner,
            teamColorHome: TEAM_COLOR_MAP[homeTeamName] ?? '#666',

            awayTeamId: Number(awayTeamObj?.id) || null,
            awayTeamName,
            awayLogoLocal,
            awayLogoEspn,
            awayScore,
            awayWinner,
            teamColorAway: TEAM_COLOR_MAP[awayTeamName] ?? '#666',

            status: statusNormalized,
            statusDetail: statDetail,

            isPrimetime,
            primetimeType,
          };

          return game;
        } catch (err) {
          console.error('❌ Failed to normalize event:', err);
          return null;
        }
      })
    );

    return {
      year,
      seasonType,
      week,
      events: normalizedEvents.filter(Boolean) as NormalizedGameDTO[],
    };
  }

  private gameHasScores(teamScore: number): boolean {
    let rc: boolean = false;
    if(teamScore !== null && teamScore > 0) {
      rc =  true;
    }else{
      rc = false;
    }
    return rc;
  }
  private async fetchRefObject(ref: string | undefined): Promise<any | null> {
    try {
      if (!ref) return null;
      const { data } = await axios.get(ref);
      return data ?? null;
    } catch {
      return null;
    }
  }
}
