// src/infrastructure/repositories/PrismaGameRepository.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Game } from "../../domain/game/entities/Game";
import type { IGameRepository, GameFilters } from "../../domain/game/repositories/IGameRepository";
import type { PaginationParams, PaginatedResponse } from "@/shared/types/common";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // at top with other imports

export class PrismaGameRepository implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

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
        preseason: data.preseason ?? null,
        gameDate: data.gameDate ?? null,
        homeTeamId: data.homeTeamId!,
        awayTeamId: data.awayTeamId!,
        gameLocation: data.gameLocation ?? null,
        gameCity: data.gameCity ?? null,
        gameStateProvince: data.gameStateProvince ?? null,
        gameCountry: data.gameCountry ?? undefined, // let default 'USA' work if undefined
        homeScore: data.homeScore ?? undefined,
        awayScore: data.awayScore ?? undefined,
        gameStatus: (data.gameStatus as any) ?? undefined,
        espnEventId: data.espnEventId ?? undefined,
        espnCompetitionId: data.espnCompetitionId ?? undefined,
      },
    });
    return Game.fromPersistence(created as any);
  }

  async findById(id: number): Promise<Game | null> {
    const row = await this.prisma.game.findUnique({ where: { id } });
    return row ? Game.fromPersistence(row as any) : null;
  }

  async findByIdWithTeams(id: number): Promise<{ game: Game; homeTeam: any; awayTeam: any } | null> {
    const row = await this.prisma.game.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    if (!row) return null;
    const { homeTeam, awayTeam, ...g } = row;
    return {
      game: Game.fromPersistence(g as any),
      homeTeam,
      awayTeam,
    };
  }

  private buildWhere(filters?: GameFilters): Prisma.GameWhereInput {
    if (!filters) return {};
    const where: Prisma.GameWhereInput = {};

    if (filters.seasonYear) where.seasonYear = filters.seasonYear;
    if (filters.gameWeek != null) where.gameWeek = filters.gameWeek;
    if (filters.preseason != null) where.preseason = filters.preseason;
    if (filters.homeTeamId != null) where.homeTeamId = filters.homeTeamId;
    if (filters.awayTeamId != null) where.awayTeamId = filters.awayTeamId;
    if (filters.teamId != null) where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
    if (filters.gameStatus) where.gameStatus = filters.gameStatus as any;
    if (filters.gameCity) where.gameCity = { contains: filters.gameCity };
    if (filters.gameCountry) where.gameCountry = { contains: filters.gameCountry };
    if (filters.dateFrom || filters.dateTo) {
      where.gameDate = {};
      if (filters.dateFrom) (where.gameDate as any).gte = filters.dateFrom;
      if (filters.dateTo) (where.gameDate as any).lte = filters.dateTo;
    }

    return where;
    }

  async findAll(filters?: GameFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Game>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(filters);

    const [rows, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ seasonYear: 'desc' }, { gameWeek: 'asc' }, { gameDate: 'asc' }],
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      data: rows.map((r) => Game.fromPersistence(r as any)),
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
        preseason: data.preseason ?? undefined,
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
    });
    return Game.fromPersistence(updated as any);
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
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findByTeamSeasonWeek(teamId: number, seasonYear: string, gameWeek: number): Promise<Game[]> {
    const rows = await this.prisma.game.findMany({
      where: { seasonYear, gameWeek, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: [{ gameDate: 'asc' }],
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findUpcomingGames(teamId?: number, limit = 10): Promise<Game[]> {
    const now = new Date();
    const where: Prisma.GameWhereInput = { gameDate: { gt: now } };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
      take: limit,
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findCompletedGames(teamId?: number, limit = 10): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { gameStatus: 'completed' as any };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'desc' }],
      take: limit,
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findPreseasonGames(teamId?: number, seasonYear?: number): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { preseason: 1 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = String(seasonYear);

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { preseason: 0 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }],
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findRegularSeasonGameByWeek(teamId?: number, seasonYear?: string, week?: number): Promise<Game[]> {
    const where: Prisma.GameWhereInput = { preseason: 0 };
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;
    if (week != null) (where as any).gameWeek = week;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameDate: 'asc' }],
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async findAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<Game[]> {
    const where: Prisma.GameWhereInput = {};
    if (teamId != null) (where as any).OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    if (seasonYear != null) (where as any).seasonYear = seasonYear;

    const rows = await this.prisma.game.findMany({
      where,
      orderBy: [{ gameWeek: 'asc' }, { gameDate: 'asc' }],
    });
    return rows.map((r) => Game.fromPersistence(r as any));
  }

  async checkGameConflict(homeTeamId: number, awayTeamId: number, gameDate: Date, seasonYear: string): Promise<boolean> {
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

  // ---------- ESPN upsert ----------
  /**
   * Interface signature you pasted:
   * upsertByKey(
   *   { espnCompetitionId, espnEventId, seasonYear, preseason, gameWeek, homeTeamId, awayTeamId },
   *   { seasonYear, gameWeek, preseason, gameDate, homeTeamId, awayTeamId, homeScore, awayScore, gameStatus, espnEventId, espnCompetitionId }
   * ): Promise<Game>
   */
 // src/infrastructure/repositories/PrismaGameRepository.ts


// Make sure this file has:
// import { Prisma } from '@prisma/client'

async upsertByKey(
  key: {
    espnCompetitionId: string;
    espnEventId: string;
    seasonYear: string;
    preseason: number;   // using number (1/0) to match schema
    gameWeek: number;
    homeTeamId: number;
    awayTeamId: number;
  },
  data: {
    readonly seasonYear: string;
    readonly gameWeek: number;
    readonly preseason: number;
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
  const evtId  = key.espnEventId       || data.espnEventId;

  // keep update/create payloads aligned with your schema
  const update: Prisma.GameUncheckedUpdateInput = {
    seasonYear: data.seasonYear,
    gameWeek: data.gameWeek,
    preseason: data.preseason,
    gameDate: (data.gameDate ?? null) as any, // ensure null not undefined for deterministic composite
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    homeScore: data.homeScore ?? undefined,
    awayScore: data.awayScore ?? undefined,
    gameStatus: (data.gameStatus as any) ?? undefined,
    espnEventId: evtId,
    espnCompetitionId: compId,
  };

  const create: Prisma.GameUncheckedCreateInput = {
    seasonYear: data.seasonYear,
    gameWeek: data.gameWeek,
    preseason: data.preseason,
    gameDate: (data.gameDate ?? null) as any, // see note above
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    homeScore: (data.homeScore ?? null) as any,
    awayScore: (data.awayScore ?? null) as any,
    gameStatus: (data.gameStatus as any) ?? undefined,
    espnEventId: evtId,
    espnCompetitionId: compId,
  };

  // helper: merge into an existing row by your composite unique
  const mergeIntoComposite = async () => {
    if (!data.gameDate) return null; // composite in your schema uses gameDate
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
      });
      return Game.fromPersistence(row as any);
    } catch (e: any) {
      // If the CREATE path tripped your composite unique (unique_game), merge into that row instead.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        (
          (Array.isArray((e.meta as any)?.target) && (e.meta as any).target.includes('unique_game')) ||
          String(e.message).includes('unique_game')
        )
      ) {
        const merged = await mergeIntoComposite();
        if (merged) return Game.fromPersistence(merged as any);
      }
      throw e;
    }
  }

  // 2) Next, try espnEventId (also unique in your schema)
  if (evtId) {
    try {
      const row = await this.prisma.game.upsert({
        where: { espnEventId: evtId },
        update,
        create,
      });
      return Game.fromPersistence(row as any);
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        (
          (Array.isArray((e.meta as any)?.target) && (e.meta as any).target.includes('unique_game')) ||
          String(e.message).includes('unique_game')
        )
      ) {
        const merged = await mergeIntoComposite();
        if (merged) return Game.fromPersistence(merged as any);
      }
      throw e;
    }
  }

  // 3) No ESPN ids: try composite direct (if we have a date), else create.
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
      ? await this.prisma.game.update({ where: { id: existing.id }, data: update })
      : await this.prisma.game.create({ data: create });
    return Game.fromPersistence(row as any);
  }

  // Last resort: blind create (rare in ESPN path)
  const row = await this.prisma.game.create({ data: create });
  return Game.fromPersistence(row as any);
}


}
