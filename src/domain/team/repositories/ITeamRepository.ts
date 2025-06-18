// src/domain/team/repositories/ITeamRepository.ts
import { Team } from '../entities/Team';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface TeamFilters {
  name?: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  stadium?: string;
  scheduleId?: number;
}

export interface ITeamRepository {
  save(team: Team): Promise<Team>;
  findById(id: number): Promise<Team | null>;
  findAll(filters?: TeamFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Team>>;
  update(id: number, team: Team): Promise<Team>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific query methods
  findByName(name: string): Promise<Team | null>;
  findByConference(conference: string): Promise<Team[]>;
  findByDivision(division: string): Promise<Team[]>;
  findByLocation(city: string, state: string): Promise<Team[]>;
  findByState(state: string): Promise<Team[]>;
  findByScheduleId(scheduleId: number): Promise<Team | null>;
  findTeamsWithSchedules(): Promise<Team[]>;
  findTeamsWithoutSchedules(): Promise<Team[]>;
  countByConference(): Promise<{ conference: string; count: number }[]>;
  countByDivision(): Promise<{ division: string; count: number }[]>;
}