// src/modules/draftOrder/infrastructure/persistence/prisma/PrismaGameFactsRepository.ts
import type { PrismaClient, Game_gameStatus } from '@prisma/client'
import type {
  GameFact,
  GameFactsRepository,
  ListGameFactsQuery,
} from '@/modules/draftOrder/domain/repositories/GameFactsRepository'

export class PrismaGameFactsRepository implements GameFactsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listFinalGames(query: ListGameFactsQuery): Promise<ReadonlyArray<GameFact>> {
    const rows = await this.prisma.game.findMany({
      where: {
        seasonYear: query.seasonYear,
        seasonType: query.seasonType,
        gameStatus: 'final' satisfies Game_gameStatus,
        ...(query.throughWeek !== null ? { gameWeek: { lte: query.throughWeek } } : {}),
      },
      select: {
        id: true,
        seasonYear: true,
        seasonType: true,
        gameWeek: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        gameStatus: true,
      },
    })

    return rows.map((r): GameFact => ({
      gameId: r.id,
      seasonYear: r.seasonYear,
      seasonType: r.seasonType ?? 2,
      week: r.gameWeek ?? null,
      homeTeamId: r.homeTeamId,
      awayTeamId: r.awayTeamId,
      homeScore: r.homeScore ?? null,
      awayScore: r.awayScore ?? null,
      status: r.gameStatus,
    }))
  }
}
