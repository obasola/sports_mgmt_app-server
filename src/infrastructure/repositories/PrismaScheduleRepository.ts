// src/infrastructure/repositories/PrismaScheduleRepository.ts
import { IScheduleRepository, ScheduleFilters } from '@/domain/schedule/repositories/IScheduleRepository';
import { Schedule } from '@/domain/schedule/entities/Schedule';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaScheduleRepository implements IScheduleRepository {
  async save(schedule: Schedule): Promise<Schedule> {
    const data = schedule.toPersistence();
    const { id, ...createData } = data;

    const savedSchedule = await prisma.schedule.create({
      data: createData,
    });

    return Schedule.fromPersistence(savedSchedule);
  }

  async findById(id: number): Promise<Schedule | null> {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    return schedule ? Schedule.fromPersistence(schedule) : null;
  }

  async findAll(
    filters?: ScheduleFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Schedule>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { seasonYear: 'desc' },
          { scheduleWeek: 'asc' },
          { gameDate: 'asc' }
        ],
      }),
      prisma.schedule.count({ where }),
    ]);

    return {
      data: schedules.map((schedule) => Schedule.fromPersistence(schedule)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, schedule: Schedule): Promise<Schedule> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Schedule', id);
    }

    const data = schedule.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    return Schedule.fromPersistence(updatedSchedule);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('Schedule', id);
    }

    await prisma.schedule.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.schedule.count({
      where: { id },
    });
    return count > 0;
  }

  async findByTeamAndSeason(teamId: number, seasonYear: number): Promise<Schedule[]> {
    const schedules = await prisma.schedule.findMany({
      where: {
        teamId,
        seasonYear,
      },
      orderBy: [
        { scheduleWeek: 'asc' },
        { gameDate: 'asc' }
      ],
    });

    return schedules.map((schedule) => Schedule.fromPersistence(schedule));
  }

  async findByOpponentTeam(oppTeamId: number): Promise<Schedule[]> {
    const schedules = await prisma.schedule.findMany({
      where: {
        oppTeamId,
      },
      orderBy: [
        { seasonYear: 'desc' },
        { scheduleWeek: 'asc' }
      ],
    });

    return schedules.map((schedule) => Schedule.fromPersistence(schedule));
  }

  async findUpcomingGames(teamId?: number): Promise<Schedule[]> {
    const where: any = {
      wonLostFlag: null, // Games without results are upcoming
    };

    if (teamId) {
      where.teamId = teamId;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [
        { gameDate: 'asc' },
        { scheduleWeek: 'asc' }
      ],
    });

    return schedules.map((schedule) => Schedule.fromPersistence(schedule));
  }

  async findCompletedGames(teamId?: number): Promise<Schedule[]> {
    const where: any = {
      wonLostFlag: { not: null }, // Games with results are completed
    };

    if (teamId) {
      where.teamId = teamId;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [
        { seasonYear: 'desc' },
        { scheduleWeek: 'desc' }
      ],
    });

    return schedules.map((schedule) => Schedule.fromPersistence(schedule));
  }

  private buildWhereClause(filters?: ScheduleFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters.seasonYear) {
      where.seasonYear = filters.seasonYear;
    }

    if (filters.oppTeamId) {
      where.oppTeamId = filters.oppTeamId;
    }

    if (filters.oppTeamConference) {
      where.oppTeamConference = { contains: filters.oppTeamConference, mode: 'insensitive' };
    }

    if (filters.oppTeamDivision) {
      where.oppTeamDivision = { contains: filters.oppTeamDivision, mode: 'insensitive' };
    }

    if (filters.scheduleWeek) {
      where.scheduleWeek = filters.scheduleWeek;
    }

    if (filters.gameCity) {
      where.gameCity = { contains: filters.gameCity, mode: 'insensitive' };
    }

    if (filters.gameStateProvince) {
      where.gameStateProvince = { contains: filters.gameStateProvince, mode: 'insensitive' };
    }

    if (filters.gameCountry) {
      where.gameCountry = { contains: filters.gameCountry, mode: 'insensitive' };
    }

    if (filters.wonLostFlag) {
      where.wonLostFlag = filters.wonLostFlag;
    }

    if (filters.homeOrAway) {
      where.homeOrAway = filters.homeOrAway;
    }

    if (filters.completed !== undefined) {
      if (filters.completed) {
        where.wonLostFlag = { not: null };
      } else {
        where.wonLostFlag = null;
      }
    }

    return where;
  }
}
