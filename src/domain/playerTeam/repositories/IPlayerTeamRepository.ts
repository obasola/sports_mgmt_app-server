// src/domain/playerteam/repositories/IPlayerTeamRepository.ts
import { PlayerTeam } from '../entities/PlayerTeam';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface PlayerTeamFilters {
  playerId?: number;
  teamId?: number;
  jerseyNumber?: number;
  currentTeam?: boolean;
  contractValue?: number;
  contractLength?: number;
}

export interface IPlayerTeamRepository {
  save(playerTeam: PlayerTeam): Promise<PlayerTeam>;
  findById(id: number): Promise<PlayerTeam | null>;
  findAll(filters?: PlayerTeamFilters, pagination?: PaginationParams): Promise<PaginatedResponse<PlayerTeam>>;
  update(id: number, playerTeam: PlayerTeam): Promise<PlayerTeam>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  
  // Domain-specific query methods
  findByPlayerId(playerId: number): Promise<PlayerTeam[]>;
  findByTeamId(teamId: number): Promise<PlayerTeam[]>;
  findByPlayerAndTeam(playerId: number, teamId: number): Promise<PlayerTeam[]>;
  findCurrentTeamContracts(): Promise<PlayerTeam[]>;
  findCurrentTeamForPlayer(playerId: number): Promise<PlayerTeam | null>;
  findPlayersForCurrentTeam(teamId: number): Promise<PlayerTeam[]>;
  checkJerseyNumberAvailable(teamId: number, jerseyNumber: number, excludeId?: number): Promise<boolean>;
}