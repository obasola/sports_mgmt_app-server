import { Result } from '../../../shared/domain/Result';
import { PrismaService } from '@/shared/infrastructure/persistence/prisma.service';
import { PrismaClient } from '@prisma/client';
import { CombineScore } from './combine-score.entity';
import { CombineScoreRepository } from './combine-score.repository';

export class CombineScorePrismaRepository implements CombineScoreRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient() as any;
  }

  /**
   * Find a combine score by id
   */
  async findById(id: number): Promise<Result<CombineScore | null>> {
    try {
      const combineScoreData = await this.prisma.combineScore.findUnique({
        where: { id },
      });

      if (!combineScoreData) {
        return Result.ok<CombineScore | null>(null);
      }

      const combineScoreResult = CombineScore.create({
        id: combineScoreData.id,
        fortyTime: combineScoreData.fortyTime || undefined,
        tenYardSplit: combineScoreData.tenYardSplit || undefined,
        twentyYardShuttle: combineScoreData.twentyYardShuttle || undefined,
        threeCone: combineScoreData.threeCone || undefined,
        verticalLeap: combineScoreData.verticalLeap || undefined,
        broadJump: combineScoreData.broadJump || undefined,
        playerId: combineScoreData.playerId || undefined,
      });

      if (combineScoreResult.isFailure) {
        return Result.fail<CombineScore | null>(combineScoreResult.error as string);
      }

      return Result.ok<CombineScore | null>(combineScoreResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<CombineScore | null>(
        `Failed to fetch combine score: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find combine score by player id
   */
  async findByPlayerId(playerId: number): Promise<Result<CombineScore | null>> {
    try {
      const combineScoreData = await this.prisma.combineScore.findFirst({
        where: { playerId },
      });

      if (!combineScoreData) {
        return Result.ok<CombineScore | null>(null);
      }

      const combineScoreResult = CombineScore.create({
        id: combineScoreData.id,
        fortyTime: combineScoreData.fortyTime || undefined,
        tenYardSplit: combineScoreData.tenYardSplit || undefined,
        twentyYardShuttle: combineScoreData.twentyYardShuttle || undefined,
        threeCone: combineScoreData.threeCone || undefined,
        verticalLeap: combineScoreData.verticalLeap || undefined,
        broadJump: combineScoreData.broadJump || undefined,
        playerId: combineScoreData.playerId || undefined,
      });

      if (combineScoreResult.isFailure) {
        return Result.fail<CombineScore | null>(combineScoreResult.error as string);
      }

      return Result.ok<CombineScore | null>(combineScoreResult.getValue());
    } catch (error) {
      console.error(`Error in findByPlayerId: ${(error as Error).message}`);
      return Result.fail<CombineScore | null>(
        `Failed to fetch combine score by player ID: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all combine scores
   */
  async findAll(limit = 100, offset = 0): Promise<Result<CombineScore[]>> {
    try {
      const combineScoresData = await this.prisma.combineScore.findMany({
        skip: offset,
        take: limit,
      });

      const combineScores: CombineScore[] = [];

      for (const combineScoreData of combineScoresData) {
        const combineScoreResult = CombineScore.create({
          id: combineScoreData.id,
          fortyTime: combineScoreData.fortyTime || undefined,
          tenYardSplit: combineScoreData.tenYardSplit || undefined,
          twentyYardShuttle: combineScoreData.twentyYardShuttle || undefined,
          threeCone: combineScoreData.threeCone || undefined,
          verticalLeap: combineScoreData.verticalLeap || undefined,
          broadJump: combineScoreData.broadJump || undefined,
          playerId: combineScoreData.playerId || undefined,
        });

        if (combineScoreResult.isSuccess) {
          combineScores.push(combineScoreResult.getValue());
        }
      }

      return Result.ok<CombineScore[]>(combineScores);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<CombineScore[]>(
        `Failed to fetch combine scores: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find combine scores by filters
   */
  async findByFilters(
    filters: Partial<{
      fortyTimeLessThan: number;
      verticalLeapGreaterThan: number;
      broadJumpGreaterThan: number;
    }>,
  ): Promise<Result<CombineScore[]>> {
    try {
      const where: any = {};

      if (filters.fortyTimeLessThan !== undefined) {
        where.fortyTime = {
          lt: filters.fortyTimeLessThan,
          not: null,
        };
      }

      if (filters.verticalLeapGreaterThan !== undefined) {
        where.verticalLeap = {
          gt: filters.verticalLeapGreaterThan,
          not: null,
        };
      }

      if (filters.broadJumpGreaterThan !== undefined) {
        where.broadJump = {
          gt: filters.broadJumpGreaterThan,
          not: null,
        };
      }

      const combineScoresData = await this.prisma.combineScore.findMany({
        where,
      });

      const combineScores: CombineScore[] = [];

      for (const combineScoreData of combineScoresData) {
        const combineScoreResult = CombineScore.create({
          id: combineScoreData.id,
          fortyTime: combineScoreData.fortyTime || undefined,
          tenYardSplit: combineScoreData.tenYardSplit || undefined,
          twentyYardShuttle: combineScoreData.twentyYardShuttle || undefined,
          threeCone: combineScoreData.threeCone || undefined,
          verticalLeap: combineScoreData.verticalLeap || undefined,
          broadJump: combineScoreData.broadJump || undefined,
          playerId: combineScoreData.playerId || undefined,
        });

        if (combineScoreResult.isSuccess) {
          combineScores.push(combineScoreResult.getValue());
        }
      }

      return Result.ok<CombineScore[]>(combineScores);
    } catch (error) {
      console.error(`Error in findByFilters: ${(error as Error).message}`);
      return Result.fail<CombineScore[]>(
        `Failed to fetch combine scores by filters: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a new combine score
   */
  async create(combineScore: CombineScore): Promise<Result<CombineScore>> {
    try {
      const combineScoreData = combineScore.toObject();

      // Remove id if it exists to let the database generate it
      if (combineScoreData.id !== undefined) {
        delete (combineScoreData as any).id;
      }

      const createdCombineScore = await this.prisma.combineScore.create({
        data: combineScoreData,
      });

      const combineScoreResult = CombineScore.create({
        id: createdCombineScore.id,
        fortyTime: createdCombineScore.fortyTime || undefined,
        tenYardSplit: createdCombineScore.tenYardSplit || undefined,
        twentyYardShuttle: createdCombineScore.twentyYardShuttle || undefined,
        threeCone: createdCombineScore.threeCone || undefined,
        verticalLeap: createdCombineScore.verticalLeap || undefined,
        broadJump: createdCombineScore.broadJump || undefined,
        playerId: createdCombineScore.playerId || undefined,
      });

      if (combineScoreResult.isFailure) {
        return Result.fail<CombineScore>(combineScoreResult.error as string);
      }

      return Result.ok<CombineScore>(combineScoreResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<CombineScore>(
        `Failed to create combine score: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Update an existing combine score
   */
  async update(id: number, combineScore: CombineScore): Promise<Result<CombineScore>> {
    try {
      const combineScoreData = combineScore.toObject();

      // Ensure the correct ID is used
      delete (combineScoreData as any).id;

      const updatedCombineScore = await this.prisma.combineScore.update({
        where: { id },
        data: combineScoreData,
      });

      const combineScoreResult = CombineScore.create({
        id: updatedCombineScore.id,
        fortyTime: updatedCombineScore.fortyTime || undefined,
        tenYardSplit: updatedCombineScore.tenYardSplit || undefined,
        twentyYardShuttle: updatedCombineScore.twentyYardShuttle || undefined,
        threeCone: updatedCombineScore.threeCone || undefined,
        verticalLeap: updatedCombineScore.verticalLeap || undefined,
        broadJump: updatedCombineScore.broadJump || undefined,
        playerId: updatedCombineScore.playerId || undefined,
      });

      if (combineScoreResult.isFailure) {
        return Result.fail<CombineScore>(combineScoreResult.error as string);
      }

      return Result.ok<CombineScore>(combineScoreResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<CombineScore>(
        `Failed to update combine score: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Delete a combine score
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.combineScore.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete combine score: ${(error as Error).message}`);
    }
  }
}
