// src/modules/schedule/domain/schedule.repository.ts
import { Schedule } from '../domain/schedule.entity';

export interface ScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findById(id: number): Promise<Schedule | null>;
  findByTeamId(teamId: number): Promise<Schedule[]>;
  findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Schedule[]>;
  findByWeek(seasonYear: string, week: number): Promise<Schedule[]>;
  findByDate(date: Date): Promise<Schedule[]>;
  create(schedule: Schedule): Promise<Schedule>;
  update(schedule: Schedule): Promise<Schedule>;
  delete(id: number): Promise<boolean>;
}
