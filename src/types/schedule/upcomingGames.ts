// src/types/schedule/upcomingGames.ts

export type GameStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Final'
  | 'Postponed'

export type PrimetimeType = 'TNF' | 'SNF' | 'MNF' | null