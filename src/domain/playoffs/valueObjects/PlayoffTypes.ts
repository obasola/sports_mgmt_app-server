// src/domain/playoffs/valueObjects/PlayoffTypes.ts
export type PlayoffRound = 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE' | 'SUPERBOWL';
export type PlayoffConference = 'AFC' | 'NFC';

export interface PlayoffMatchup {
  gameId: number | null;        // null if not scheduled yet
  seasonYear: number;
  round: PlayoffRound;
  conference: PlayoffConference;
  slot: string;                 // e.g. "AFC_WC_2v7", "NFC_DIV_1v4"
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeSeed: number | null;
  awaySeed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: number | null;
  gameDate: Date | null;
}

