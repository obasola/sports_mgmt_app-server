import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';
import { Result } from '../../../../shared/domain/Result';
import { DraftPick } from '../../domain/draft-pick.entity';
import { DraftPickRepository } from '../../domain/draft-pick.repository';
import { PrismaClient } from '@prisma/client';
import { DraftPickWithDetailsDTO } from '../../application/dtos/draft-pick-with-details.dto';

export class DraftPickPrismaRepository implements DraftPickRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient() as any;
  }

  /**
   * Find a draft pick by id
   */
  async findById(id: number): Promise<Result<DraftPick | null>> {
    try {
      const draftPickData = await this.prisma.draftPick.findUnique({
        where: { id },
      });

      if (!draftPickData) {
        return Result.ok<DraftPick | null>(null);
      }

      const draftPickResult = DraftPick.create({
        id: draftPickData.id,
        round: draftPickData.round,
        pickNumber: draftPickData.pickNumber,
        draftYear: draftPickData.draftYear,
        currentTeamId: draftPickData.currentTeamId,
        prospectId: draftPickData.prospectId || undefined,
        playerId: draftPickData.playerId || undefined,
        used: draftPickData.used,
        originalTeam: draftPickData.originalTeam || undefined,
        createdAt: draftPickData.createdAt || undefined,
        updatedAt: draftPickData.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick | null>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick | null>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<DraftPick | null>(
        `Failed to fetch draft pick: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all draft picks
   */
  async findAll(limit = 100, offset = 0): Promise<Result<DraftPick[]>> {
    try {
      const draftPicksData = await this.prisma.draftPick.findMany({
        skip: offset,
        take: limit,
        orderBy: [{ draftYear: 'desc' }, { round: 'asc' }, { pickNumber: 'asc' }],
      });

      const draftPicks: DraftPick[] = [];

      for (const draftPickData of draftPicksData) {
        const draftPickResult = DraftPick.create({
          id: draftPickData.id,
          round: draftPickData.round,
          pickNumber: draftPickData.pickNumber,
          draftYear: draftPickData.draftYear,
          currentTeamId: draftPickData.currentTeamId,
          prospectId: draftPickData.prospectId || undefined,
          playerId: draftPickData.playerId || undefined,
          used: draftPickData.used,
          originalTeam: draftPickData.originalTeam || undefined,
          createdAt: draftPickData.createdAt || undefined,
          updatedAt: draftPickData.updatedAt || undefined,
        });

        if (draftPickResult.isSuccess) {
          draftPicks.push(draftPickResult.getValue());
        }
      }

      return Result.ok<DraftPick[]>(draftPicks);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<DraftPick[]>(`Failed to fetch draft picks: ${(error as Error).message}`);
    }
  }

  /**
   * Find draft picks by filters
   */
  async findByFilters(
    filters: Partial<{
      round: number;
      pickNumber: number;
      draftYear: number;
      currentTeamId: number;
      used: boolean;
      originalTeam: number;
    }>,
  ): Promise<Result<DraftPick[]>> {
    try {
      const where: any = {};

      if (filters.round !== undefined) {
        where.round = filters.round;
      }

      if (filters.pickNumber !== undefined) {
        where.pickNumber = filters.pickNumber;
      }

      if (filters.draftYear !== undefined) {
        where.draftYear = filters.draftYear;
      }

      if (filters.currentTeamId !== undefined) {
        where.currentTeamId = filters.currentTeamId;
      }

      if (filters.used !== undefined) {
        where.used = filters.used;
      }

      if (filters.originalTeam !== undefined) {
        where.originalTeam = filters.originalTeam;
      }

      const draftPicksData = await this.prisma.draftPick.findMany({
        where,
        orderBy: [{ draftYear: 'desc' }, { round: 'asc' }, { pickNumber: 'asc' }],
      });

      const draftPicks: DraftPick[] = [];

      for (const draftPickData of draftPicksData) {
        const draftPickResult = DraftPick.create({
          id: draftPickData.id,
          round: draftPickData.round,
          pickNumber: draftPickData.pickNumber,
          draftYear: draftPickData.draftYear,
          currentTeamId: draftPickData.currentTeamId,
          prospectId: draftPickData.prospectId || undefined,
          playerId: draftPickData.playerId || undefined,
          used: draftPickData.used,
          originalTeam: draftPickData.originalTeam || undefined,
          createdAt: draftPickData.createdAt || undefined,
          updatedAt: draftPickData.updatedAt || undefined,
        });

        if (draftPickResult.isSuccess) {
          draftPicks.push(draftPickResult.getValue());
        }
      }

      return Result.ok<DraftPick[]>(draftPicks);
    } catch (error) {
      console.error(`Error in findByFilters: ${(error as Error).message}`);
      return Result.fail<DraftPick[]>(
        `Failed to fetch draft picks by filters: ${(error as Error).message}`,
      );
    }
  }

  async findDraftPicksWithDetails(): Promise<DraftPickWithDetailsDTO[]> {
    // Use Prisma's raw SQL feature with consistent backtick quoting for MySQL
    const draftPicks = await this.prisma.$queryRaw`
      SELECT 
        dp.id,
        dp.draftYear,
        dp.round,
        dp.pickNumber,
        dp.playerId,
        pt.teamId,
        p.firstName as playerFirstName,
        p.lastName as playerLastName,
        t.name as teamName
      FROM DraftPick dp
      LEFT JOIN Player p ON dp.playerId = p.id
      LEFT JOIN PlayerTeam pt ON p.id = pt.playerId AND pt.endDate IS NULL
      LEFT JOIN Team t ON pt.teamId = t.id
      ORDER BY dp.draftYear DESC, dp.round ASC, dp.pickNumber ASC
    `;

    // Cast the result to the proper type after query execution
    return draftPicks as unknown as DraftPickWithDetailsDTO[];
  }

  async findDraftPicksByYearWithDetails(year: number): Promise<DraftPickWithDetailsDTO[]> {
    const draftPicks = await this.prisma.$queryRaw`
      SELECT 
        dp.id,
        dp.draftYear,
        dp.round,
        dp.pickNumber,
        dp.playerId,
        pt.teamId,
        p.firstName as playerFirstName,
        p.lastName as playerLastName,
        t.name as teamName
      FROM DraftPick dp
      LEFT JOIN Player p ON dp.playerId = p.id
      LEFT JOIN PlayerTeam pt ON p.id = pt.playerId AND pt.endDate IS NULL
      LEFT JOIN Team t ON pt.teamId = t.id
      WHERE dp.draftYear = ${year}
      ORDER BY dp.round ASC, dp.pickNumber ASC
    `;

    return draftPicks as unknown as DraftPickWithDetailsDTO[];
  }

  async findDraftPicksByTeamWithDetails(teamId: number): Promise<DraftPickWithDetailsDTO[]> {
    const draftPicks = await this.prisma.$queryRaw`
      SELECT 
        dp.id,
        dp.draftYear,
        dp.round,
        dp.pickNumber,
        dp.playerId,
        pt.teamId,
        p.firstName as playerFirstName,
        p.lastName as playerLastName,
        t.name as teamName
      FROM DraftPick dp
      LEFT JOIN Player p ON dp.playerId = p.id
      LEFT JOIN PlayerTeam pt ON p.id = pt.playerId AND pt.endDate IS NULL
      LEFT JOIN Team t ON pt.teamId = t.id
      WHERE p.teamId = ${teamId}

      
      ORDER BY dp.draftYear DESC, dp.round ASC, dp.pickNumber ASC
    `;

    return draftPicks as unknown as DraftPickWithDetailsDTO[];
  }
  // Alternative query that doesn't filter by endDate to get all team history
  async findDraftPicksWithAllTeamHistory(): Promise<DraftPickWithDetailsDTO[]> {
    const draftPicks = await this.prisma.$queryRaw`
    SELECT 
      dp.id,
      dp.draftYear,
      dp.round,
      dp.pickNumber,
      dp.playerId,
      pt.teamId,
      p.firstName as playerFirstName,
      p.lastName as playerLastName,
      t.name as teamName,
      pt.startDate as playerTeamStartDate,
      pt.endDate as playerTeamEndDate
    FROM DraftPick dp
    LEFT JOIN Player p ON dp.playerId = p.id
    LEFT JOIN PlayerTeam pt ON p.id = pt.playerId
    LEFT JOIN Team t ON pt.teamId = t.id
    ORDER BY dp.draftYear DESC, dp.round ASC, dp.pickNumber ASC, pt.startDate DESC
  `;

    return draftPicks as unknown as DraftPickWithDetailsDTO[];
  }

  // Query to get the team that drafted a player (their first team assignment)
  async findDraftPicksWithDraftingTeam(): Promise<DraftPickWithDetailsDTO[]> {
    const draftPicks = await this.prisma.$queryRaw`
    SELECT 
      dp.id,
      dp.draftYear,
      dp.round,
      dp.pickNumber,
      dp.playerId,
      pt.teamId,
      p.firstName as playerFirstName,
      p.lastName as playerLastName,
      t.name as teamName
    FROM DraftPick dp
    LEFT JOIN Player p ON dp.playerId = p.id
    LEFT JOIN PlayerTeam pt ON p.id = pt.playerId 
    LEFT JOIN Team t ON pt.teamId = t.id
    WHERE pt.id = (
      SELECT id 
      FROM PlayerTeam 
      WHERE playerId = dp.playerId 
      ORDER BY startDate ASC 
      LIMIT 1
    )
    ORDER BY dp.draftYear DESC, dp.round ASC, dp.pickNumber ASC
  `;

    return draftPicks as unknown as DraftPickWithDetailsDTO[];
  }

  /**
   * Create a new draft pick
   */
  async create(draftPick: DraftPick): Promise<Result<DraftPick>> {
    try {
      const draftPickData = draftPick.toObject();

      // Remove id if it exists to let the database generate it
      if (draftPickData.id !== undefined) {
        delete (draftPickData as any).id;
      }

      // Ensure the 'used' property has a value
      draftPickData.used = draftPickData.used ?? false;

      // Set default timestamps if not present
      if (!draftPickData.createdAt) {
        draftPickData.createdAt = new Date();
      }

      if (!draftPickData.updatedAt) {
        draftPickData.updatedAt = new Date();
      }

      const createdDraftPick = await this.prisma.draftPick.create({
        data: draftPickData,
      });

      const draftPickResult = DraftPick.create({
        id: createdDraftPick.id,
        round: createdDraftPick.round,
        pickNumber: createdDraftPick.pickNumber,
        draftYear: createdDraftPick.draftYear,
        currentTeamId: createdDraftPick.currentTeamId,
        prospectId: createdDraftPick.prospectId || undefined,
        playerId: createdDraftPick.playerId || undefined,
        used: createdDraftPick.used,
        originalTeam: createdDraftPick.originalTeam || undefined,
        createdAt: createdDraftPick.createdAt || undefined,
        updatedAt: createdDraftPick.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<DraftPick>(`Failed to create draft pick: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing draft pick
   */
  async update(id: number, draftPick: DraftPick): Promise<Result<DraftPick>> {
    try {
      const draftPickData = draftPick.toObject();

      // Ensure the correct ID is used
      delete (draftPickData as any).id;

      // Always update the updatedAt timestamp
      draftPickData.updatedAt = new Date();

      const updatedDraftPick = await this.prisma.draftPick.update({
        where: { id },
        data: draftPickData,
      });

      const draftPickResult = DraftPick.create({
        id: updatedDraftPick.id,
        round: updatedDraftPick.round,
        pickNumber: updatedDraftPick.pickNumber,
        draftYear: updatedDraftPick.draftYear,
        currentTeamId: updatedDraftPick.currentTeamId,
        prospectId: updatedDraftPick.prospectId || undefined,
        playerId: updatedDraftPick.playerId || undefined,
        used: updatedDraftPick.used,
        originalTeam: updatedDraftPick.originalTeam || undefined,
        createdAt: updatedDraftPick.createdAt || undefined,
        updatedAt: updatedDraftPick.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<DraftPick>(`Failed to update draft pick: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a draft pick
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.draftPick.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete draft pick: ${(error as Error).message}`);
    }
  }

  /**
   * Find draft picks by draft year
   */
  async findByDraftYear(draftYear: number): Promise<Result<DraftPick[]>> {
    return this.findByFilters({ draftYear });
  }

  /**
   * Find draft picks by team
   */
  async findByTeam(teamId: number): Promise<Result<DraftPick[]>> {
    return this.findByFilters({ currentTeamId: teamId });
  }

  /**
   * Find unused draft picks by team
   */
  async findUnusedByTeam(teamId: number): Promise<Result<DraftPick[]>> {
    return this.findByFilters({ currentTeamId: teamId, used: false });
  }

  /**
   * Find draft pick by round, pick number, and year
   */
  async findByRoundPickYear(
    round: number,
    pickNumber: number,
    draftYear: number,
  ): Promise<Result<DraftPick | null>> {
    try {
      const draftPickData = await this.prisma.draftPick.findFirst({
        where: {
          round,
          pickNumber,
          draftYear,
        },
      });

      if (!draftPickData) {
        return Result.ok<DraftPick | null>(null);
      }

      const draftPickResult = DraftPick.create({
        id: draftPickData.id,
        round: draftPickData.round,
        pickNumber: draftPickData.pickNumber,
        draftYear: draftPickData.draftYear,
        currentTeamId: draftPickData.currentTeamId,
        prospectId: draftPickData.prospectId || undefined,
        playerId: draftPickData.playerId || undefined,
        used: draftPickData.used,
        originalTeam: draftPickData.originalTeam || undefined,
        createdAt: draftPickData.createdAt || undefined,
        updatedAt: draftPickData.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick | null>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick | null>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in findByRoundPickYear: ${(error as Error).message}`);
      return Result.fail<DraftPick | null>(
        `Failed to fetch draft pick by round, pick, and year: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find draft picks by prospect ID
   */
  async findByProspectId(prospectId: number): Promise<Result<DraftPick | null>> {
    try {
      const draftPickData = await this.prisma.draftPick.findFirst({
        where: { prospectId },
      });

      if (!draftPickData) {
        return Result.ok<DraftPick | null>(null);
      }

      const draftPickResult = DraftPick.create({
        id: draftPickData.id,
        round: draftPickData.round,
        pickNumber: draftPickData.pickNumber,
        draftYear: draftPickData.draftYear,
        currentTeamId: draftPickData.currentTeamId,
        prospectId: draftPickData.prospectId || undefined,
        playerId: draftPickData.playerId || undefined,
        used: draftPickData.used,
        originalTeam: draftPickData.originalTeam || undefined,
        createdAt: draftPickData.createdAt || undefined,
        updatedAt: draftPickData.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick | null>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick | null>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in findByProspectId: ${(error as Error).message}`);
      return Result.fail<DraftPick | null>(
        `Failed to fetch draft pick by prospect ID: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find draft picks by player ID
   */
  async findByPlayerId(playerId: number): Promise<Result<DraftPick | null>> {
    try {
      const draftPickData = await this.prisma.draftPick.findFirst({
        where: { playerId },
      });

      if (!draftPickData) {
        return Result.ok<DraftPick | null>(null);
      }

      const draftPickResult = DraftPick.create({
        id: draftPickData.id,
        round: draftPickData.round,
        pickNumber: draftPickData.pickNumber,
        draftYear: draftPickData.draftYear,
        currentTeamId: draftPickData.currentTeamId,
        prospectId: draftPickData.prospectId || undefined,
        playerId: draftPickData.playerId || undefined,
        used: draftPickData.used,
        originalTeam: draftPickData.originalTeam || undefined,
        createdAt: draftPickData.createdAt || undefined,
        updatedAt: draftPickData.updatedAt || undefined,
      });

      if (draftPickResult.isFailure) {
        return Result.fail<DraftPick | null>(draftPickResult.error as string);
      }

      return Result.ok<DraftPick | null>(draftPickResult.getValue());
    } catch (error) {
      console.error(`Error in findByPlayerId: ${(error as Error).message}`);
      return Result.fail<DraftPick | null>(
        `Failed to fetch draft pick by player ID: ${(error as Error).message}`,
      );
    }
  }
}
