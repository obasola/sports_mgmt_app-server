// src/infrastructure/repositories/PrismaCombineScoreRepository.ts
import { ICombineScoreRepository, CombineScoreFilters } from '@/domain/combineScore/repositories/ICombineScoreRepository';
import { CombineScore } from '@/domain/combineScore/entities/CombineScore';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaCombineScoreRepository implements ICombineScoreRepository {
  async save(combineScore: CombineScore): Promise<CombineScore> {
    const data = combineScore.toPersistence();
    const { id, ...createData } = data;

    const savedCombineScore = await prisma.combineScore.create({
      data: createData,
    });

    return CombineScore.fromPersistence(savedCombineScore);
  }

  async findById(id: number): Promise<CombineScore | null> {
    const combineScore = await prisma.combineScore.findUnique({
      where: { id },
    });

    return combineScore ? CombineScore.fromPersistence(combineScore) : null;
  }

  async findAll(
    filters?: CombineScoreFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<CombineScore>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [combineScores, total] = await Promise.all([
      prisma.combineScore.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.combineScore.count({ where }),
    ]);

    return {
      data: combineScores.map((combineScore) => CombineScore.fromPersistence(combineScore)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, combineScore: CombineScore): Promise<CombineScore> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('CombineScore', id);
    }

    const data = combineScore.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedCombineScore = await prisma.combineScore.update({
      where: { id },
      data: updateData,
    });

    return CombineScore.fromPersistence(updatedCombineScore);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('CombineScore', id);
    }

    await prisma.combineScore.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.combineScore.count({
      where: { id },
    });
    return count > 0;
  }

  async findByPlayerId(playerId: number): Promise<CombineScore | null> {
    const combineScore = await prisma.combineScore.findFirst({
      where: { playerId },
    });

    return combineScore ? CombineScore.fromPersistence(combineScore) : null;
  }

  async findByPlayerIds(playerIds: number[]): Promise<CombineScore[]> {
    const combineScores = await prisma.combineScore.findMany({
      where: { 
        playerId: { 
          in: playerIds 
        } 
      },
      orderBy: { playerId: 'asc' },
    });

    return combineScores.map((combineScore) => CombineScore.fromPersistence(combineScore));
  }

  async findTopPerformers(metric: string, limit: number = 10): Promise<CombineScore[]> {
    let orderBy: Record<string, 'asc' | 'desc'> = {};

    // Determine sort order based on metric (lower is better for times, higher for distances/heights)
    switch (metric) {
      case 'fortyTime':
      case 'tenYardSplit':
      case 'twentyYardShuttle':
      case 'threeCone':
        orderBy[metric] = 'asc'; // Lower times are better
        break;
      case 'verticalLeap':
      case 'broadJump':
        orderBy[metric] = 'desc'; // Higher distances/heights are better
        break;
      default:
        throw new Error(`Invalid metric: ${metric}`);
    }

    const combineScores = await prisma.combineScore.findMany({
      where: {
        [metric]: {
          not: null,
        },
      },
      orderBy,
      take: limit,
    });

    return combineScores.map((combineScore) => CombineScore.fromPersistence(combineScore));
  }

  async findByAthleticScoreRange(minScore: number, maxScore: number): Promise<CombineScore[]> {
    // This is a complex query that would require computed fields
    // For now, we'll fetch all records and filter in memory
    // In a production system, you'd want to add computed columns or use raw SQL
    const combineScores = await prisma.combineScore.findMany({
      where: {
        OR: [
          { fortyTime: { not: null } },
          { verticalLeap: { not: null } },
          { broadJump: { not: null } },
          { twentyYardShuttle: { not: null } },
          { threeCone: { not: null } },
        ],
      },
    });

    return combineScores
      .map((cs) => CombineScore.fromPersistence(cs))
      .filter((combineScore) => {
        const score = combineScore.getOverallAthleticScore();
        return score >= minScore && score <= maxScore;
      });
  }

  private buildWhereClause(filters?: CombineScoreFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.playerId) {
      where.playerId = filters.playerId;
    }

    if (filters.fortyTimeMin !== undefined) {
      where.fortyTime = { 
        ...(where.fortyTime as object || {}),
        gte: filters.fortyTimeMin 
      };
    }

    if (filters.fortyTimeMax !== undefined) {
      where.fortyTime = { 
        ...(where.fortyTime as object || {}),
        lte: filters.fortyTimeMax 
      };
    }

    if (filters.verticalLeapMin !== undefined) {
      where.verticalLeap = { 
        ...(where.verticalLeap as object || {}),
        gte: filters.verticalLeapMin 
      };
    }

    if (filters.verticalLeapMax !== undefined) {
      where.verticalLeap = { 
        ...(where.verticalLeap as object || {}),
        lte: filters.verticalLeapMax 
      };
    }

    if (filters.broadJumpMin !== undefined) {
      where.broadJump = { 
        ...(where.broadJump as object || {}),
        gte: filters.broadJumpMin 
      };
    }

    if (filters.broadJumpMax !== undefined) {
      where.broadJump = { 
        ...(where.broadJump as object || {}),
        lte: filters.broadJumpMax 
      };
    }

    if (filters.hasCompleteWorkout !== undefined) {
      if (filters.hasCompleteWorkout) {
        // All major metrics must be present
        where.AND = [
          { fortyTime: { not: null } },
          { verticalLeap: { not: null } },
          { broadJump: { not: null } },
          { twentyYardShuttle: { not: null } },
          { threeCone: { not: null } },
        ];
      } else {
        // At least one major metric is missing
        where.OR = [
          { fortyTime: null },
          { verticalLeap: null },
          { broadJump: null },
          { twentyYardShuttle: null },
          { threeCone: null },
        ];
      }
    }

    return where;
  }
}