// src/domain/combineScore/repositories/ICombineScoreRepository.ts
import { CombineScore } from '../entities/CombineScore';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface CombineScoreFilters {
  playerId?: number;
  fortyTimeMin?: number;
  fortyTimeMax?: number;
  verticalLeapMin?: number;
  verticalLeapMax?: number;
  broadJumpMin?: number;
  broadJumpMax?: number;
  hasCompleteWorkout?: boolean;
}

export interface ICombineScoreRepository {
  save(combineScore: CombineScore): Promise<CombineScore>;
  findById(id: number): Promise<CombineScore | null>;
  findAll(filters?: CombineScoreFilters, pagination?: PaginationParams): Promise<PaginatedResponse<CombineScore>>;
  update(id: number, combineScore: CombineScore): Promise<CombineScore>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByPlayerId(playerId: number): Promise<CombineScore | null>;
  findByPlayerIds(playerIds: number[]): Promise<CombineScore[]>;
  findTopPerformers(metric: string, limit?: number): Promise<CombineScore[]>;
  findByAthleticScoreRange(minScore: number, maxScore: number): Promise<CombineScore[]>;
}