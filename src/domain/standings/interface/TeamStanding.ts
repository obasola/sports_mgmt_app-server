// src/domain/stamdings/interface/TeamStanding.ts
export interface TeamStanding {
  teamId: number;
  teamName: string;
  conference: string;
  division: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  divisionWins: number;
  divisionLosses: number;
  conferenceWins: number;
  conferenceLosses: number;
  playoffSeed?: number | null;
}
