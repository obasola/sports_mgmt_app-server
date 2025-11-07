// src/infrastructure/repositories/PrismaGameRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { Game } from '../../domain/game/entities/Game';
import type { IGameRepository, GameFilters } from '../../domain/game/repositories/IGameRepository';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class PrismaGameRepository implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  // Shared include object for team relations
  private readonly teamInclude = {
    homeTeam: true,
    awayTeam: true,
  };

  // ---------- ESPN helper mapping ----------
  async findTeamIdByEspnTeamId(id: string): Promise<number | null> {
    const n = Number(id);
    const t = await this.prisma.team.findFirst({ where: { espnTeamId: n }, select: { id: true } });
    return t?.id ?? null;
  }

  async findTeamIdByAbbrev(abbreviation: string): Promise<number | null> {
    const t = await this.prisma.team.findFirst({ where: { abbreviation }, select: { id: true } });
    return t?.id ?? null;
  }

  // ---------- Domain CRUD ----------
  async save(game: Game): Promise<Game> {
    const data = game.toPersistence();
    const created = await this.prisma.game.create({
      data: {
        seasonYear: data.seasonYear!,
        gameWeek: data.gameWeek ?? null,
        seasonType: data.seasonType ?? null,
        gameDate: data.gameDate ?? null,
        homeTeamId: data.homeTeamId!,
        awayTeamId: data.awayTeamId!,
        gameLocation: data.gameLocation ?? null,
        gameCity: data.gameCity ?? null,
        gameStateProvince: data.gameStateProvince ?? null,
        gameCountry: data.gameCountry ?? undefined,
        homeScore: data.homeScore ?? undefined,
        awayScore: data.awayScore ?? undefined,
        gameStatus: (data.gameStatus as any) ?? undefined,
        espnEventId: data.espnEventId ?? undefined,
        espnCompetitionId: data.espnCompetitionId ?? undefined,
      },
      include: this.teamInclude,
    });
    return this.hydrateGameWithTeams(created);
  }

  async findById(id: number): Promise<Game | null> {
    const row = await this.prisma.game.findUnique({
      where: { id },
      include: this.teamInclude,
    });
    return row ? this.hydrateGameWithTeams(row) : null;
  }

  async findByIdWithTeams(
    id: number
  ): Promise<{ game: Game; homeTeam: any; awayTeam: any } | null> {
    const row = await this.prisma.game.findUnique({
      where: { id },
      include: this.teamInclude,
    });
    if (!row) return null;
    const { homeTeam, awayTeam, ...g } = row;
    return {
      game: this.hydrateGameWithTeams(row),
      homeTeam,
      awayTeam,
    };
  }

  private buildWhere(filters?: GameFilters): Prisma.GameWhereInput {
    if (!filters) return {};
    const where: Prisma.GameWhereInput = {};

    if (filters.seasonYear) where.seasonYear = filters.seasonYear;
    if (filters.gameWeek != null) where.gameWeek = filters.gameWeek;
    if (filters.seasonType != null) where.seasonType = filters.seasonType;
    if (filters.homeTeamId != null) where.homeTeamId = filters.homeTeamId;
    if (filters.awayTeamId != null) where.awayTeamId = filters.awayTeamId;
    if (filters.teamId != null)
      where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
    if (filters.gameStatus) where.gameStatus = filters.gameStatus as any;
    if (filters.gameCity) where.gameCity = { contains: filters.gameCity };
    if (filters.gameCountry) where.gameCountry = { contains: filters.gameCountry };
    if (filters.dateFrom || filters.dateTo) {
      where.gameDate = {};
      if (filters.dateFrom) (where.gameDate as any).gte = filters.dateFrom;
      if (filters.dateTo) (where.gameDate as any).lte = filters.dateTo;
    }
    console.log('where params: ', where);
    return where;
  }

  async findAll(
    filters?: GameFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Game>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filters);

    console.log('filters: ', filters);
    console.log('where: ', where);
    const [rows, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ seasonYear: 'desc' }, { gameWeek: 'asc' }, { gameDate: 'asc' }],
        include: this.teamInclude,
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.hydrateGameWithTeams(r)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async update(id: number, game: Game): Promise<Game> {
    const data = game.toPersistence();
    const updated = await this.prisma.game.update({
      where: { id },
      data: {
        seasonYear: data.seasonYear ?? undefined,
        gameWeek: data.gameWeek ?? undefined,
        seasonType: data.seasonType ?? undefined,
        gameDate: data.gameDate ?? undefined,
        homeTeamId: data.homeTeamId ?? undefined,
        awayTeamId: data.awayTeamId ?? undefined,
        gameLocation: data.gameLocation ?? undefined,
        gameCity: data.gameCity ?? undefined,
        gameStateProvince: data.gameStateProvince ?? undefined,
        gameCountry: data.gameCountry ?? undefined,
        homeScore: data.homeScore ?? undefined,
        awayScore: data.awayScore ?? undefined,
        gameStatus: (data.gameStatus as any) ?? undefined,
        espnEventId: data.espnEventId ?? undefined,
        espnCompetitionId: data.espnCompetitionId ?? undefined,
      },
      include: this.teamInclude,
    });
    return this.hydrateGameWithTeams(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.game.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.game.count({ where: { id } });
    return count > 0;
  }

  async findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Game[]> {
    const rows = await this.prisma.game.findMany({
      where: { seasonYear, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findByTeamSeasonWeek(
    teamId: number,
    seasonYear: string,
    gameWeek: number
  ): Promise<Game[]> {
    const rows = await this.prisma.game.findMany({
      where: { seasonYear, gameWeek, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: [{ gameDate: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findUpcomingGames(teamId?: number, limit = 10): Promise<Game[]> {
    const now = new Date();
    const where: Prisma.GameWhereInput = { gameDate: { gt: now } };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
      take: limit,
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findCompletedGames(teamId?: number, limit = 10): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { gameStatus: 'completed' as any };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'desc' }],
      take: limit,
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findPreseasonGames(teamId?: number, seasonYear?: number): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { seasonType: 1 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = String(seasonYear);

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { seasonType: 2 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findRegularSeasonGameByWeek(
    teamId?: number,
    seasonYear?: string,
    week?: number
  ): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { seasonType: 2 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;
    if (week != null) (where as any).gameWeek = week;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
  }

  async findAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: Prisma.GameWhereInput = {};
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
      include: this.teamInclude,
    });
    return rows.map((r) => this.hydrateGameWithTeams(r));
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

  /**
   * Helper to hydrate a Game entity with team relations
   */
  private hydrateGameWithTeams(row: any): Game {
    const { homeTeam, awayTeam, ...gameData } = row;
    const game = Game.fromPersistence(gameData as any);

    // Attach team data using setters
    if (homeTeam) {
      game.homeTeam = homeTeam;
    }
    if (awayTeam) {
      game.awayTeam = awayTeam;
    }

    return game;
  }
  /**
   * Find a game by ESPN competition ID (unique key).
   */
  async findByEspnCompetitionId(espnCompetitionId: string): Promise<Game | null> {
    const row = await this.prisma.game.findUnique({
      where: { espnCompetitionId },
      include: this.teamInclude,
    });
    return row ? this.hydrateGameWithTeams(row) : null;
  }

  // ---------- ESPN upsert ----------
  async upsertByKey(
    key: {
      espnCompetitionId: string;
      espnEventId: string;
      seasonYear: string;
      seasonType: number;
      gameWeek: number;
      homeTeamId: number;
      awayTeamId: number;
    },
    data: {
      readonly seasonYear: string;
      readonly gameWeek: number;
      readonly seasonType: number;
      readonly gameDate: Date | null;
      readonly homeTeamId: number;
      readonly awayTeamId: number;
      readonly homeScore: number | null;
      readonly awayScore: number | null;
      readonly gameStatus: string | null;
      readonly espnEventId: string;
      readonly espnCompetitionId: string;
    }
  ): Promise<Game> {
    const compId = key.espnCompetitionId || data.espnCompetitionId;
    const evtId = key.espnEventId || data.espnEventId;

    const update: Prisma.GameUncheckedUpdateInput = {
      seasonYear: String(data.seasonYear),
      gameWeek: data.gameWeek,
      seasonType: data.seasonType,
      gameDate: (data.gameDate ?? null) as any,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeScore: data.homeScore ?? undefined,
      awayScore: data.awayScore ?? undefined,
      gameStatus: (data.gameStatus as any) ?? undefined,
      espnEventId: evtId,
      espnCompetitionId: compId,
    };

    const create: Prisma.GameUncheckedCreateInput = {
      seasonYear: String(data.seasonYear),
      gameWeek: data.gameWeek,
      seasonType: data.seasonType,
      gameDate: (data.gameDate ?? null) as any,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeScore: (data.homeScore ?? null) as any,
      awayScore: (data.awayScore ?? null) as any,
      gameStatus: (data.gameStatus as any) ?? undefined,
      espnEventId: evtId,
      espnCompetitionId: compId,
    };

    const mergeIntoComposite = async () => {
      if (!data.gameDate) return null;
      const existing = await this.prisma.game.findFirst({
        where: {
          seasonYear: data.seasonYear,
          gameDate: data.gameDate,
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
        },
      });
      if (!existing) return null;
      const row = await this.prisma.game.update({
        where: { id: existing.id },
        data: update,
        include: this.teamInclude,
      });
      return row;
    };

    // 1) Prefer espnCompetitionId (unique)
    if (compId) {
      try {
        const row = await this.prisma.game.upsert({
          where: { espnCompetitionId: compId },
          update,
          create,
          include: this.teamInclude,
        });
        return this.hydrateGameWithTeams(row);
      } catch (e: any) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          ((Array.isArray((e.meta as any)?.target) &&
            (e.meta as any).target.includes('unique_game')) ||
            String(e.message).includes('unique_game'))
        ) {
          const merged = await mergeIntoComposite();
          if (merged) return this.hydrateGameWithTeams(merged);
        }
        throw e;
      }
    }

    // 2) Next, try espnEventId
    if (evtId) {
      try {
        const row = await this.prisma.game.upsert({
          where: { espnEventId: evtId },
          update,
          create,
          include: this.teamInclude,
        });
        return this.hydrateGameWithTeams(row);
      } catch (e: any) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          ((Array.isArray((e.meta as any)?.target) &&
            (e.meta as any).target.includes('unique_game')) ||
            String(e.message).includes('unique_game'))
        ) {
          const merged = await mergeIntoComposite();
          if (merged) return this.hydrateGameWithTeams(merged);
        }
        throw e;
      }
    }

    // 3) No ESPN ids: try composite direct
    if (data.gameDate) {
      const existing = await this.prisma.game.findFirst({
        where: {
          seasonYear: data.seasonYear,
          gameDate: data.gameDate,
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
        },
      });
      const row = existing
        ? await this.prisma.game.update({
            where: { id: existing.id },
            data: update,
            include: this.teamInclude,
          })
        : await this.prisma.game.create({
            data: create,
            include: this.teamInclude,
          });
      return this.hydrateGameWithTeams(row);
    }

    // Last resort: blind create
    const row = await this.prisma.game.create({
      data: create,
      include: this.teamInclude,
    });
    return this.hydrateGameWithTeams(row);
  }
}
