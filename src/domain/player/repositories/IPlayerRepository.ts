// src/domain/player/repositories/IPlayerRepository.ts
import { Player } from '../entities/Player';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface PlayerFilters {
  firstName?: string;
  lastName?: string;
  position?: string;
  university?: string;
  status?: string;
  homeState?: string;
  homeCity?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  yearEnteredLeague?: number;
  prospectId?: number;
  search?: string; // For full-text search across name fields
}

export interface IPlayerRepository {
  save(player: Player): Promise<Player>;
  findById(id: number): Promise<Player | null>;
  findAll(filters?: PlayerFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Player>>;
  update(id: number, player: Player): Promise<Player>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific query methods
  findByName(firstName: string, lastName: string): Promise<Player[]>;
  findByTeamId(teamId: number): Promise<Player[]>;
  findByPosition(position: string): Promise<Player[]>;
  findByUniversity(university: string): Promise<Player[]>;
  findByProspectId(prospectId: number): Promise<Player | null>;
  findRookies(): Promise<Player[]>;
  findVeterans(minYears?: number): Promise<Player[]>;
  findByYearEnteredLeague(year: number): Promise<Player[]>;
  findByStatus(status: string): Promise<Player[]>;
  findByLocation(city?: string, state?: string): Promise<Player[]>;
  findByPhysicalRange(
    minHeight?: number,
    maxHeight?: number,
    minWeight?: number,
    maxWeight?: number
  ): Promise<Player[]>;
  
  // Statistical queries
  getAverageAge(): Promise<number>;
  getAverageHeightByPosition(position: string): Promise<number | null>;
  getAverageWeightByPosition(position: string): Promise<number | null>;
  countByPosition(): Promise<Array<{ position: string; count: number }>>;
  countByUniversity(): Promise<Array<{ university: string; count: number }>>;
  countByStatus(): Promise<Array<{ status: string; count: number }>>;
}