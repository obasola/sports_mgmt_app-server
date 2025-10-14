import { PrismaClient, Game_gameStatus  } from '@prisma/client';
import { IStandingsRepository } from '@/domain/standings/repositories/IStandingsRepository';
 
export class PrismaStandingsRepository implements IStandingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getCompletedGames(year: number, seasonType: number) {
    const preseason = 0;  // boolean, must be zero meaning NO not preseason
    return this.prisma.game.findMany({
      where: {
        seasonYear: String(year),
        preseason,
        gameStatus: Game_gameStatus.completed,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  }
}

