// src/infrastructure/repositories/PrismaTeamRepository.ts
import { ITeamRepository, TeamFilters } from '@/domain/team/repositories/ITeamRepository';
import { Team } from '@/domain/team/entities/Team';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaTeamRepository implements ITeamRepository {
  async save(team: Team): Promise<Team> {
    const data = team.toPersistence();
    const { id, ...createData } = data;

    const savedTeam = await prisma.team.create({
      data: createData,
    });

    return Team.fromPersistence(savedTeam);
  }

  async findById(id: number): Promise<Team | null> {
    const team = await prisma.team.findUnique({
      where: { id },
    });

    return team ? Team.fromPersistence(team) : null;
  }

  async findAll(
    filters?: TeamFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Team>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.team.count({ where }),
    ]);

    return {
      data: teams.map((team) => Team.fromPersistence(team)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, team: Team): Promise<Team> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Team', id);
    }

    const data = team.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
    });

    return Team.fromPersistence(updatedTeam);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Team', id);
    }

    await prisma.team.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.team.count({
      where: { id },
    });
    return count > 0;
  }

  async findByName(name: string): Promise<Team | null> {
    const team = await prisma.team.findFirst({
      where: { 
        name: { 
          equals: name,
        } 
      },
    });

    return team ? Team.fromPersistence(team) : null;
  }

  async findByConference(conference: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { 
        conference: { 
          equals: conference,
        } 
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async findByDivision(division: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { 
        division: { 
          equals: division,
        } 
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async findByLocation(city: string, state: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: {
        AND: [
          { city: { equals: city} },
          { state: { equals: state} },
        ],
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async findByState(state: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { 
        state: { 
          equals: state,
        } 
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async findByScheduleId(scheduleId: number): Promise<Team | null> {
    const team = await prisma.team.findFirst({
      where: { scheduleId },
    });

    return team ? Team.fromPersistence(team) : null;
  }

  async findTeamsWithSchedules(): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: {
        scheduleId: {
          not: null,
        },
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async findTeamsWithoutSchedules(): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: {
        scheduleId: null,
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.fromPersistence(team));
  }

  async countByConference(): Promise<{ conference: string; count: number }[]> {
    const result = await prisma.team.groupBy({
      by: ['conference'],
      _count: {
        conference: true,
      },
      where: {
        conference: {
          not: null,
        },
      },
      orderBy: {
        conference: 'asc',
      },
    });

    return result.map((item) => ({
      conference: item.conference!,
      count: item._count.conference,
    }));
  }

  async countByDivision(): Promise<{ division: string; count: number }[]> {
    const result = await prisma.team.groupBy({
      by: ['division'],
      _count: {
        division: true,
      },
      where: {
        division: {
          not: null,
        },
      },
      orderBy: {
        division: 'asc',
      },
    });

    return result.map((item) => ({
      division: item.division!,
      count: item._count.division,
    }));
  }

  private buildWhereClause(filters?: TeamFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters.conference) {
      where.conference = { contains: filters.conference, mode: 'insensitive' };
    }

    if (filters.division) {
      where.division = { contains: filters.division, mode: 'insensitive' };
    }

    if (filters.stadium) {
      where.stadium = { contains: filters.stadium, mode: 'insensitive' };
    }

    if (filters.scheduleId) {
      where.scheduleId = filters.scheduleId;
    }

    return where;
  }
}