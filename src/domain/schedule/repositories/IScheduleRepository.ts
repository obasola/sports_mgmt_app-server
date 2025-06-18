
// src/domain/schedule/repositories/IScheduleRepository.ts
import { Schedule } from '../entities/Schedule';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface ScheduleFilters {
  teamId?: number;
  seasonYear?: number;
  oppTeamId?: number;
  oppTeamConference?: string;
  oppTeamDivision?: string;
  scheduleWeek?: number;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  wonLostFlag?: string;
  homeOrAway?: string;
  completed?: boolean; // Filter for games with results
}

export interface IScheduleRepository {
  save(schedule: Schedule): Promise<Schedule>;
  findById(id: number): Promise<Schedule | null>;
  findAll(filters?: ScheduleFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Schedule>>;
  update(id: number, schedule: Schedule): Promise<Schedule>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByTeamAndSeason(teamId: number, seasonYear: number): Promise<Schedule[]>;
  findByOpponentTeam(oppTeamId: number): Promise<Schedule[]>;
  findUpcomingGames(teamId?: number): Promise<Schedule[]>;
  findCompletedGames(teamId?: number): Promise<Schedule[]>;
}