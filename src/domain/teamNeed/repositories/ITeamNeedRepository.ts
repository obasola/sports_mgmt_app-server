// src/domain/teamNeed/repositories/ITeamNeedRepository.ts
import { TeamNeed } from '../entities/TeamNeed';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface TeamNeedFilters {
  teamId?: number;
  position?: string;
  priority?: number;
  draftYear?: number;
}

export interface ITeamNeedRepository {
  save(teamNeed: TeamNeed): Promise<TeamNeed>;
  findById(id: number): Promise<TeamNeed | null>;
  findAll(filters?: TeamNeedFilters, pagination?: PaginationParams): Promise<PaginatedResponse<TeamNeed>>;
  update(id: number, teamNeed: TeamNeed): Promise<TeamNeed>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific query methods
  findByTeamId(teamId: number): Promise<TeamNeed[]>;
  findByPosition(position: string): Promise<TeamNeed[]>;
  findHighPriorityNeeds(teamId?: number): Promise<TeamNeed[]>;
  findByDraftYear(draftYear: number): Promise<TeamNeed[]>;
  findTeamNeedsByPriority(teamId: number, priority: number): Promise<TeamNeed[]>;
}