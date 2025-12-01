// src/utils/schedule/scheduleTypes.ts

export type GameStatus = 'Scheduled' | 'In Progress' | 'Final' | 'Postponed';
export type PrimetimeType = 'TNF' | 'SNF' | 'MNF' | null;

export interface WeekScheduleDTO {
  year: number;       // e.g., 2025
  seasonType: number; // 1 = preseason, 2 = regular, 3 = postseason
  week: number;       // 1–18 (or 0 for preseason)
  events: NormalizedGameDTO[];
}

export interface EventDTO {
  id: number;
  date: string | null;
  name: string | null;
  shortName: string | null;
  status: string | null;
  seasonYear: number;
  seasonType: number;
  week: number;
  competitions?: any;
}

// NEW: Scoring play DTO
export interface ScoringPlayDTO {
  id: number;
  text: string;
  /** Quarter number (0 if unknown) */
  period: number;
  /** Clock display like "10:21" */
  clockDisplay: string;
  homeScore: number | null;
  awayScore: number | null;
  /** e.g. "Pass", "Rush", "FG", or null if ESPN doesn't provide it */
  type: string | null;
}

export interface NormalizedGameDTO {
  id: number;

  date: string | null;
  dateFormatted: {
    day: string;
    time: string;
  };

  homeTeamId: number | null;
  homeTeamName: string;
  homeLogoEspn: string;
  homeLogoLocal: string;
  homeScore: number | null;
  homeWinner: boolean;
  teamColorHome: string;

  awayTeamId: number | null;
  awayTeamName: string;
  awayLogoEspn: string;
  awayLogoLocal: string;
  awayScore: number | null;
  awayWinner: boolean;
  teamColorAway: string;

  status: GameStatus;
  statusDetail: string;

  isPrimetime: boolean;
  primetimeType: PrimetimeType;

  // NEW: scoring text and full play list
  scoringSummaryShort: string | null;
  scoringPlays: ScoringPlayDTO[];
}
