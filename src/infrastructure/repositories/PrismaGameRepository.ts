// Prisma Repository Implementation
// src/infrastructure/repositories/PrismaGameRepository.ts
import { IGameRepository, GameFilters } from '@/domain/game/repositories/IGameRepository';
import { Game } from '@/domain/game/entities/Game';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaGameRepository implements IGameRepository {
  prisma = new PrismaClient();
  async save(game: Game): Promise<Game> {
    const data = game.toPersistence();
    const { id, ...createData } = data;

    const savedGame = await this.prisma.game.create({
      data: createData as Prisma.GameUncheckedCreateInput,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    // test
    const { homeTeam, awayTeam, ...gameData } = savedGame;
    return Game.fromPersistence(savedGame);
  }

  async findById(id: number): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({
      where: { id },
      // ✅ NO include - clean game data only
    });

    return game ? Game.fromPersistence(game) : null;
  }

  // ✅ CLEAN: Complex method with relations
  async findByIdWithTeams(
    id: number
  ): Promise<{ game: Game; homeTeam: any; awayTeam: any } | null> {
    const result = await this.prisma.game.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!result) return null;

    // ✅ CORRECT: Separate contaminated data
    const { homeTeam, awayTeam, ...gameData } = result;
    const game = Game.fromPersistence(gameData);

    return { game, homeTeam, awayTeam };
  }

  async findPreseasonGames(teamId?: number, seasonYear?: number, preseasonWeek?: number): Promise<Game[]> {
    const where: any = {
      seasonYear: seasonYear ? seasonYear : { not: null },
    };

    where.AND = {
      preseason: preseasonWeek ? preseasonWeek : { not: null },
    };

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: [{ preseason: 'asc' }, { gameDate: 'asc' }],
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async findRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: any = {
      gameWeek: { not: null },
      preseason: null,
    };

    if (seasonYear) {
      where.seasonYear = seasonYear;
    }

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async findAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: any = {
      gameWeek: { not: null },
    };

    if (seasonYear) {
      where.seasonYear = seasonYear;
    }

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async findAll(
    filters?: GameFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Game>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;
    console.log("PrismaGameRepository::findAll - entryPoint");
    const where = this.buildWhereClause(filters);

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ gameDate: 'desc' }, { id: 'desc' }],
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      data: games.map((game) => Game.fromPersistence(game)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, game: Game): Promise<Game> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Game', id);
    }

    const data = game.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: updateData as Prisma.GameUncheckedUpdateInput,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return Game.fromPersistence(updatedGame);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Game', id);
    }

    await this.prisma.game.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.game.count({
      where: { id },
    });
    return count > 0;
  }

  async findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: {
        seasonYear,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async findUpcomingGames(teamId?: number, limit?: number): Promise<Game[]> {
    const where: any = {
      gameStatus: 'scheduled',
      gameDate: {
        gte: new Date(),
      },
    };

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: { gameDate: 'asc' },
      take: limit || 10,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async findCompletedGames(teamId?: number, limit?: number): Promise<Game[]> {
    const where: any = {
      gameStatus: 'completed',
    };

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: { gameDate: 'desc' },
      take: limit || 10,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    return games.map((game) => Game.fromPersistence(game));
  }

  async checkGameConflict(
    homeTeamId: number,
    awayTeamId: number,
    gameDate: Date,
    seasonYear: string
  ): Promise<boolean> {
    const count = await this.prisma.game.count({
      where: {
        seasonYear,
        gameDate,
        homeTeamId,
        awayTeamId,
      },
    });

    return count > 0;
  }

  private buildWhereClause(filters?: GameFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.seasonYear) {
      where.seasonYear = filters.seasonYear;
    }

    if (filters.gameWeek) {
      where.gameWeek = filters.gameWeek;
    }

    // ✅ ADD preseason filter
    if (filters.preseason) {
      where.preseason = filters.preseason;
    }

    if (filters.homeTeamId) {
      where.homeTeamId = filters.homeTeamId;
    }

    if (filters.awayTeamId) {
      where.awayTeamId = filters.awayTeamId;
    }

    if (filters.teamId) {
      where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
    }

    if (filters.gameStatus) {
      where.gameStatus = filters.gameStatus;
    }

    if (filters.gameCity) {
      where.gameCity = { contains: filters.gameCity, mode: 'insensitive' };
    }

    if (filters.gameCountry) {
      where.gameCountry = { contains: filters.gameCountry, mode: 'insensitive' };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.gameDate = {};
      if (filters.dateFrom) {
        (where.gameDate as any).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.gameDate as any).lte = filters.dateTo;
      }
    }

    return where;
  }
}
