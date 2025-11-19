// src/infrastructure/repositories/PrismaGameRepository.ts
import { PrismaClient, Prisma, Game_gameStatus } from '@prisma/client';
import { Game } from '../../domain/game/entities/Game';
import type { IGameRepository, GameFilters } from '../../domain/game/repositories/IGameRepository';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// --------------------------------------------------------------
// Map ESPN status.type.name -> Prisma Game_gameStatus enum values
// --------------------------------------------------------------
// --------------------------------------------------------------
// Map ESPN status.type.name -> Prisma Game_gameStatus enum values
// --------------------------------------------------------------
function mapEspnStatus(status: string | undefined): Game_gameStatus {
  if (!status) return Game_gameStatus.scheduled;

  const normalized = status.toUpperCase();

  if (normalized.includes('FINAL')) return Game_gameStatus.final;
  if (normalized.includes('IN_PROGRESS')) return Game_gameStatus.in_progress;
  if (normalized.includes('POSTPONED')) return Game_gameStatus.postponed;
  if (normalized.includes('CANCELED')) return Game_gameStatus.canceled;

  return Game_gameStatus.scheduled;
}

export class PrismaGameRepository implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  // Shared include object for team relations
  private readonly teamInclude = {
    homeTeam: true,
    awayTeam: true,
  };

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

  // ---------- ESPN helper mapping ----------
  async findTeamIdByEspnTeamId(id: string | number | null | undefined): Promise<number | null> {
    console.warn(`[PrismaGameRepo::findTeamIdByEspnTeamId] entryPoint - id=${id}`);
    if (!id) return null;
    const n = Number(id); // ESPN IDs come in as strings; normalize to number
    if (isNaN(n)) {
      console.warn(`[findTeamIdByEspnTeamId] Invalid espnTeamId value: ${id}`);
      return null;
    }

    const t = await this.prisma.team.findFirst({
      where: { espnTeamId: n },
      select: { id: true },
    });

    if (!t) {
      console.warn(
        `[PrismaGameRepo::findTeamIdByEspnTeamId] Fai Team record found for espnTeamId=${n}`
      );
    }
    return t?.id ?? null;
  }

  async findTeamIdByAbbrev(abbreviation: string): Promise<number | null> {
    const t = await this.prisma.team.findFirst({ where: { abbreviation }, select: { id: true } });
    return t?.id ?? null;
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

  async updatePartial(id: number, patch: Prisma.GameUpdateInput): Promise<Game> {
    const updated = await this.prisma.game.update({
      where: { id },
      data: patch,
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

  /* replacement */
  async findByEspnCompetitionId(id: string) {
    const row = this.prisma.game.findUnique({
      where: { espnCompetitionId: id },
      include: this.teamInclude,
    });
    if (!row) return null;
    return this.hydrateGameWithTeams(row);
  }

  // ---------- ESPN upsert ----------
  async upsertByKey(
    where: { espnCompetitionId: string },
    data: {
      seasonYear: string;
      gameWeek: number;
      seasonType: number;
      gameDate: Date | null;
      homeTeamId: number;
      awayTeamId: number;
      homeScore: number | null;
      awayScore: number | null;
      gameStatus: string | null;
      espnEventId: string;
      espnCompetitionId: string;
    }
  ): Promise<Game> {
    const row = await this.prisma.game.upsert({
      where,
      update: data as Prisma.GameUncheckedUpdateInput,
      create: data as Prisma.GameUncheckedCreateInput,
      include: this.teamInclude,
    });

    return this.hydrateGameWithTeams(row);
  }

  // -----------------------------------------------
  // Mapper
  // -----------------------------------------------
  private toDomain(record: any): Game {
    return Game.create({
      id: record.id,
      espnEventId: record.espnEventId,
      espnCompetitionId: record.espnCompetitionId,
      seasonYear: record.seasonYear,
      gameWeek: record.gameWeek,
      seasonType: record.seasonType,
      gameDate: record.gameDate,
      homeTeamId: record.homeTeamId,
      awayTeamId: record.awayTeamId,
      homeScore: record.homeScore,
      awayScore: record.awayScore,
      gameStatus: record.gameStatus,
      // add any additional props your Game entity constructor expects
    });
  }
}
