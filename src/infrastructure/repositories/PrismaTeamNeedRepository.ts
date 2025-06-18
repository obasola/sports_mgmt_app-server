// src/infrastructure/repositories/PrismaTeamNeedRepository.ts
import { ITeamNeedRepository, TeamNeedFilters } from '@/domain/teamNeed/repositories/ITeamNeedRepository';
import { TeamNeed } from '@/domain/teamNeed/entities/TeamNeed';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaTeamNeedRepository implements ITeamNeedRepository {
  async save(teamNeed: TeamNeed): Promise<TeamNeed> {
    const data = teamNeed.toPersistence();
    const { id, ...createData } = data;

    const savedTeamNeed = await prisma.teamNeed.create({
      data: createData as any,
    });

    return TeamNeed.fromPersistence(savedTeamNeed);
  }

  async findById(id: number): Promise<TeamNeed | null> {
    const teamNeed = await prisma.teamNeed.findUnique({
      where: { id },
    });

    return teamNeed ? TeamNeed.fromPersistence(teamNeed) : null;
  }

  async findAll(
    filters?: TeamNeedFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TeamNeed>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [teamNeeds, total] = await Promise.all([
      prisma.teamNeed.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'asc' },
          { id: 'asc' }
        ],
      }),
      prisma.teamNeed.count({ where }),
    ]);

    return {
      data: teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, teamNeed: TeamNeed): Promise<TeamNeed> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('TeamNeed', id);
    }

    const data = teamNeed.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedTeamNeed = await prisma.teamNeed.update({
      where: { id },
      data: updateData as any,
    });

    return TeamNeed.fromPersistence(updatedTeamNeed);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('TeamNeed', id);
    }

    await prisma.teamNeed.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.teamNeed.count({
      where: { id },
    });
    return count > 0;
  }

  // Domain-specific query methods
  async findByTeamId(teamId: number): Promise<TeamNeed[]> {
    const teamNeeds = await prisma.teamNeed.findMany({
      where: { teamId },
      orderBy: { priority: 'asc' },
    });

    return teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed));
  }

  async findByPosition(position: string): Promise<TeamNeed[]> {
    const teamNeeds = await prisma.teamNeed.findMany({
      where: { 
        position: { 
          equals: position, 
        } 
      },
      orderBy: { priority: 'asc' },
    });

    return teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed));
  }

  async findHighPriorityNeeds(teamId?: number): Promise<TeamNeed[]> {
    const where: any = {
      priority: { lte: 3 }, // Priority 1-3 considered high priority
    };

    if (teamId) {
      where.teamId = teamId;
    }

    const teamNeeds = await prisma.teamNeed.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { teamId: 'asc' }
      ],
    });

    return teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed));
  }

  async findByDraftYear(draftYear: number): Promise<TeamNeed[]> {
    const teamNeeds = await prisma.teamNeed.findMany({
      where: { draftYear },
      orderBy: [
        { teamId: 'asc' },
        { priority: 'asc' }
      ],
    });

    return teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed));
  }

  async findTeamNeedsByPriority(teamId: number, priority: number): Promise<TeamNeed[]> {
    const teamNeeds = await prisma.teamNeed.findMany({
      where: { 
        teamId,
        priority 
      },
      orderBy: { id: 'asc' },
    });

    return teamNeeds.map((teamNeed) => TeamNeed.fromPersistence(teamNeed));
  }

  private buildWhereClause(filters?: TeamNeedFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters.position) {
      where.position = { 
        contains: filters.position, 
        mode: 'insensitive' 
      };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.draftYear) {
      where.draftYear = filters.draftYear;
    }

    return where;
  }
}