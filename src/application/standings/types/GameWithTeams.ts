import type { Game_gameStatus } from "@prisma/client";

export interface TeamBasic {
  id: number;
  name: string;
  conference: string;
  division: string;
}

export interface GameWithTeams {
  id: number;
  seasonYear: string;
  seasonType: number;
  gameWeek?: number;
  gameStatus: Game_gameStatus;
  gameDate?: Date;

  // Foreign keys
  homeTeamId: number;
  awayTeamId: number;

  // Score fields — adjust names to match your Prisma model!
  homeTeamScoreTotal?: number | null;
  awayTeamScoreTotal?: number | null;

  // Relations
  homeTeam?: TeamBasic | null;
  awayTeam?: TeamBasic | null;
}
