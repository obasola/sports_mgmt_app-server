// src/domain/game/repositories/IGameRepository.ts
import type { Game } from '../entities/Game';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface GameFilters {
  seasonYear?: string;
  gameWeek?: number;
  preseason?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  teamId?: number; // Either home or away
  gameStatus?: string;
  gameCity?: string;
  gameCountry?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Repository interface for Game entity
 * All methods that return Game(s) MUST include team relations (homeTeam, awayTeam)
 */
export interface IGameRepository {
  // Core CRUD - All return Games WITH team relations
  save(game: Game): Promise<Game>;
  findById(id: number): Promise<Game | null>;
  findAll(filters?: GameFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Game>>;
  update(id: number, game: Game): Promise<Game>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;

  // Team and season queries - All return Games WITH team relations
  findByTeamAndSeason(teamId: number, seasonYear: string): Promise<Game[]>;
  findByTeamSeasonWeek(teamId: number, seasonYear: string, gameWeek: number): Promise<Game[]>;
  
  // Status-based queries - All return Games WITH team relations
  findUpcomingGames(teamId?: number, limit?: number): Promise<Game[]>;
  findCompletedGames(teamId?: number, limit?: number): Promise<Game[]>;
  
  // Season type queries - All return Games WITH team relations
  findPreseasonGames(teamId?: number, seasonYear?: number): Promise<Game[]>;
  findRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]>;
  findRegularSeasonGameByWeek(teamId?: number, seasonYear?: string, week?: number): Promise<Game[]>;
  findAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<Game[]>;

  // Business logic helpers
  checkGameConflict(
    homeTeamId: number,
    awayTeamId: number,
    gameDate: Date,
    seasonYear: string
  ): Promise<boolean>;

  // ESPN integration helpers
  findTeamIdByEspnTeamId(espnTeamId: string): Promise<number | null>;
  findTeamIdByAbbrev(abbreviation: string): Promise<number | null>;

  // Upsert for ESPN sync - Returns Game WITH team relations
  upsertByKey(
    key: {
      espnCompetitionId: string;
      espnEventId: string;
      seasonYear: string;
      preseason: number;
      gameWeek: number;
      homeTeamId: number;
      awayTeamId: number;
    },
    data: {
      readonly seasonYear: string;
      readonly gameWeek: number;
      readonly preseason: number;
      readonly gameDate: Date | null;
      readonly homeTeamId: number;
      readonly awayTeamId: number;
      readonly homeScore: number | null;
      readonly awayScore: number | null;
      readonly gameStatus: string | null;
      readonly espnEventId: string;
      readonly espnCompetitionId: string;
    }
  ): Promise<Game>;

  // Optional: Method to explicitly fetch with teams (for backward compatibility)
  findByIdWithTeams?(id: number): Promise<{ 
    game: Game; 
    homeTeam: any; 
    awayTeam: any;
  } | null>;

  /**
   * Fetch a single game by its ESPN competition ID.
   * Used for ESPN sync comparisons (detecting score changes, etc.).
   */
  findByEspnCompetitionId(espnCompetitionId: string): Promise<Game | null>;

}