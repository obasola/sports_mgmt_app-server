// src/modules/draftOrder/domain/repositories/GameFactsRepository

import type { Game_gameStatus } from '@prisma/client'

export interface GameFact {
  readonly gameId: number
  readonly seasonYear: string
  readonly seasonType: number
  readonly week: number | null
  readonly homeTeamId: number
  readonly awayTeamId: number
  readonly homeScore: number | null
  readonly awayScore: number | null
  readonly status: Game_gameStatus
}

export interface ListGameFactsQuery {
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek: number | null
}

export interface GameFactsRepository {
  listFinalGames(query: ListGameFactsQuery): Promise<ReadonlyArray<GameFact>>
}

