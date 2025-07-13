// Repository Interface
// src/domain/game/repositories/IGameRepository.ts
import { Game } from '../entities/Game';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface GameFilters {
  seasonYear?: string;
  gameWeek?: number;
  preseason?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  teamId?: number; // Either home or away team
  gameStatus?: string;
  gameCity?: string;
  gameCountry?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IGameRepository {
  save(game: Game): Promise<Game>;
  findById(id: number): Promise<Game | null>;
  findByIdWithTeams(id: number): Promise<{ game: Game; homeTeam: any; awayTeam: any } | null>;
  findAll(filters?: GameFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Game>>;
  update(id: number, game: Game): Promise<Game>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
  findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Game[]>;
  findByTeamSeasonWeek(teamId: number, seasonYear: string, gameWeek: number): Promise<Game[]>;
  findUpcomingGames(teamId?: number, limit?: number): Promise<Game[]>;
  findCompletedGames(teamId?: number, limit?: number): Promise<Game[]>;
  findPreseasonGames(teamId?: number, seasonYear?: number): Promise<Game[]>;
  findRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]>;
  findRegularSeasonGameByWeek(teamId?: number, seasonYear?: string, week?: number): Promise<Game[]>;
  findAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<Game[]>;
  checkGameConflict(homeTeamId: number, awayTeamId: number, gameDate: Date, seasonYear: string): Promise<boolean>;
}
