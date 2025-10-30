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
  status?: { type?: { name?: string; state?: string; completed?: boolean; detail?: string } };
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

  /**
   * Deterministic per-week scoreboard lookup.
   * Always pass year to avoid ESPN's "current season" ambiguity.
   */

  async getWeekScoreboard(seasonYear: string, seasonType: SeasonType, week: number): Promise<ScoreboardResponse> {
  const now = new Date();
  const year = seasonYear ? Number(seasonYear) : now.getFullYear();
  const url =
    `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` +
    `?year=${year}&seasontype=${seasonType}&week=${week}`;

  console.log("Fetching:", url);

  try {
    const { data } = await this.http.get<ScoreboardResponse>(url);
    return data;
  } catch (err: any) {
    console.error("❌ ESPN fetch failed:", {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      url,
      data: err?.response?.data?.slice?.(0, 200) ?? typeof err?.response?.data,
    });
    throw err;
  }
}

  
    /**
   * Deterministic per-week scoreboard lookup.
   * Always pass year to avoid ESPN's "current season" ambiguity.
   */
  async getWeek(args: { year: number; seasonType: SeasonType; week: number }): Promise<ScoreboardResponse> {
    const { year, seasonType, week } = args;
    const url =
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` +
      `?year=${year}&seasontype=${seasonType}&week=${week}`;
    const { data } = await this.http.get<ScoreboardResponse>(url);
    return data;
  }
  /**
   * Bulk season/type events (useful for auditing vs per-week pulls).
   */
  async getSeasonEvents(year: number, seasonType: SeasonType): Promise<{ items: { $ref: string }[] }> {
    const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/types/${seasonType}/events?limit=1000`;
    const { data } = await this.http.get(url);
    return data;
  }
  
}
