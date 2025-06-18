// src/domain/playerAward/repositories/IPlayerAwardRepository.ts

import { PlayerAward } from '../entities/PlayerAward';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface PlayerAwardFilters {
  playerId?: number;
  awardName?: string;
  yearAwarded?: number;
  yearFrom?: number;
  yearTo?: number;
}

export interface IPlayerAwardRepository {
  save(playerAward: PlayerAward): Promise<PlayerAward>;
  findById(id: number): Promise<PlayerAward | null>;
  findAll(filters?: PlayerAwardFilters, pagination?: PaginationParams): Promise<PaginatedResponse<PlayerAward>>;
  update(id: number, playerAward: PlayerAward): Promise<PlayerAward>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByPlayerId(playerId: number): Promise<PlayerAward[]>;
  findByAwardName(awardName: string): Promise<PlayerAward[]>;
  findByYear(year: number): Promise<PlayerAward[]>;
  countByPlayer(playerId: number): Promise<number>;
}
