// /src/infrastructure/scoreboardClient.ts
import axios, { AxiosInstance } from "axios";

export type SeasonType = 1 | 2 | 3; // 1=pre, 2=reg, 3=post

export interface EspnTeamRef {
  id: string;                 // ESPN team id (int-like string)
  abbreviation: string;       // "KC"
  displayName: string;        // "Kansas City Chiefs"
}

export interface EspnCompetitor {
  id?: string;                // often same as team.id, but keep optional
  homeAway: "home" | "away";
  score?: string;
  team: EspnTeamRef;
}

export interface EspnCompetition {
  id: string;                 // stable competition id
  date?: string;              // ISO
  status?: {
    type?: { name?: string; state?: string; completed?: boolean; detail?: string }
  };
  competitors: EspnCompetitor[];
}

export interface EspnEvent {
  id: string;                 // stable event id
  name?: string;
  competitions: EspnCompetition[];
}

export interface ScoreboardResponse {
  week?: { number?: number };
  season?: { type?: number; year?: number };
  events: EspnEvent[];
}

export class EspnScoreboardClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      timeout: 15000,
      headers: { "User-Agent": "sports_mgmt_app_server/1.0" },
    });
  }

  /** Per-week scoreboard (fast, contains competitions) */
  async getWeekScoreboard(seasonType: SeasonType, week: number): Promise<ScoreboardResponse> {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=${seasonType}&week=${week}`;
    const { data } = await this.http.get<ScoreboardResponse>(url);
    return data;
  }

  /** Optional: season/type bulk (handy for backfills or cross-checking) */
  async getSeasonEvents(year: number, seasonType: SeasonType): Promise<{ items: { $ref: string }[] }> {
    const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/types/${seasonType}/events?limit=1000`;
    const { data } = await this.http.get(url);
    return data;
  }
}
