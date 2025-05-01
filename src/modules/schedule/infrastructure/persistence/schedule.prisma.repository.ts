// src/modules/schedule/infrastructure/persistence/schedule.prisma.repository.ts
import { PrismaClient } from '@prisma/client';
import { ScheduleProps } from '../../domain/interface/schedule.props';
import { ScheduleRepository } from '../../domain/schedule.repository';
import { Schedule } from '../../domain/schedule.entity';

export class SchedulePrismaRepository implements ScheduleRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany();
    return schedules.map(this.mapPrismaScheduleToEntity);
  }

  async findById(id: number): Promise<Schedule | null> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });
    return schedule ? this.mapPrismaScheduleToEntity(schedule) : null;
  }

  async findByTeamId(teamId: number): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: { teamId },
    });
    return schedules.map(this.mapPrismaScheduleToEntity);
  }

  async findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        teamId,
        seasonYear,
      },
    });
    return schedules.map(this.mapPrismaScheduleToEntity);
  }

  async findByWeek(seasonYear: string, week: number): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        seasonYear,
        scheduleWeek: week,
      },
    });
    return schedules.map(this.mapPrismaScheduleToEntity);
  }

  async findByDate(date: Date): Promise<Schedule[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        gameDate: date,
      },
    });
    return schedules.map(this.mapPrismaScheduleToEntity);
  }

  async create(schedule: Schedule): Promise<Schedule> {
    const scheduleData = schedule.toObject();
    const created = await this.prisma.schedule.create({
      data: {
        ...scheduleData,
      },
    });
    return this.mapPrismaScheduleToEntity(created);
  }

  async update(props: Partial<ScheduleProps>): Promise<Schedule> {
    const updated = await this.prisma.schedule.update({
      where: { id: props.id },
      data: {
        ...props,
      },
    });
    return this.mapPrismaScheduleToEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.schedule.delete({
      where: { id },
    });
    return true;
  }

  private mapPrismaScheduleToEntity(prismaSchedule: any): Schedule {
    const { id, ...props } = prismaSchedule;
    console.log('working with id:' + id);
    return Schedule.create(props as ScheduleProps);
  }
}
