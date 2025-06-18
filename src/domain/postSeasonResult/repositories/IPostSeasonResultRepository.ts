// src/domain/postSeasonResult/repositories/IPostSeasonResultRepository.ts
import { PostSeasonResult } from '../entities/PostSeasonResult';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface PostSeasonResultFilters {
  teamId?: number;
  playoffYear?: number;
  lastRoundReached?: string;
  winLose?: string;
}

export interface IPostSeasonResultRepository {
  save(postSeasonResult: PostSeasonResult): Promise<PostSeasonResult>;
  findById(id: number): Promise<PostSeasonResult | null>;
  findAll(filters?: PostSeasonResultFilters, pagination?: PaginationParams): Promise<PaginatedResponse<PostSeasonResult>>;
  update(id: number, postSeasonResult: PostSeasonResult): Promise<PostSeasonResult>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific query methods
  findByTeamId(teamId: number): Promise<PostSeasonResult[]>;
  findByPlayoffYear(playoffYear: number): Promise<PostSeasonResult[]>;
  findByTeamAndYear(teamId: number, playoffYear: number): Promise<PostSeasonResult | null>;
  getTeamPlayoffHistory(teamId: number): Promise<PostSeasonResult[]>;
  getWinsByTeam(teamId: number): Promise<PostSeasonResult[]>;
  getLossesByTeam(teamId: number): Promise<PostSeasonResult[]>;
}