// src/domain/draftpick/repositories/IDraftPickRepository.ts
import { DraftPick } from '../entities/DraftPick';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface DraftPickFilters {
  round?: number;
  draftYear?: number;
  currentTeamId?: number;
  originalTeam?: number;
  used?: boolean;
  prospectId?: number;
  playerId?: number;
  minPickNumber?: number;
  maxPickNumber?: number;
  isFirstRound?: boolean;
  hasProspect?: boolean;
  hasPlayer?: boolean;
}

export interface IDraftPickRepository {
  getTeamForPick(arg0: number): any;
  updatePick(pickId: number, arg1: { prospectId: number; used: boolean; }): unknown;
  save(draftPick: DraftPick): Promise<DraftPick>;
  findById(id: number): Promise<DraftPick | null>;
  findAll(filters?: DraftPickFilters, pagination?: PaginationParams): Promise<PaginatedResponse<DraftPick>>;
  update(id: number, draftPick: DraftPick): Promise<DraftPick>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific queries
  findByTeam(teamId: number, draftYear?: number): Promise<DraftPick[]>;
  findByRound(round: number, draftYear: number): Promise<DraftPick[]>;
  findByDraftYear(draftYear: number): Promise<DraftPick[]>;
  findUnusedPicks(teamId?: number, draftYear?: number): Promise<DraftPick[]>;
  findUsedPicks(teamId?: number, draftYear?: number): Promise<DraftPick[]>;
  findTradedPicks(draftYear?: number): Promise<DraftPick[]>;
  findByPickNumber(pickNumber: number, draftYear: number): Promise<DraftPick | null>;
  findByRoundAndPickInRound(round: number, pickInRound: number, draftYear: number): Promise<DraftPick | null>;
  findFirstRoundPicks(draftYear: number): Promise<DraftPick[]>;
  findCompensatoryPicks(draftYear: number): Promise<DraftPick[]>;
  findByProspect(prospectId: number): Promise<DraftPick | null>;
  findByPlayer(playerId: number): Promise<DraftPick | null>;
  
  // Business rule validations
  isPickNumberTaken(pickNumber: number, draftYear: number): Promise<boolean>;
  getTeamPickCount(teamId: number, draftYear: number): Promise<number>;
  getNextAvailablePickNumber(round: number, draftYear: number): Promise<number>;
}