// src/application/game/services/GameService.ts
import { Game } from '@/domain/game/entities/Game';
import type { IGameRepository } from '@/domain/game/repositories/IGameRepository';
import type { 
  CreateGameDto, 
  UpdateGameDto, 
  GameFiltersDto, 
  PaginationDto,
  UpdateScoreDto 
} from '../dto/GameDto';
import type { PaginatedResponse } from '@/shared/types/common';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}

  /**
   * Create a new game
   * Repository now returns Game with team relations loaded
   */
  async createGame(dto: CreateGameDto): Promise<Game> {
    // Validate teams exist and are different
    if (dto.homeTeamId === dto.awayTeamId) {
      throw new ValidationError('Home team and away team cannot be the same');
    }

    // Check for game conflicts
    if (dto.gameDate) {
      const conflict = await this.gameRepository.checkGameConflict(
        dto.homeTeamId,
        dto.awayTeamId,
        new Date(dto.gameDate),
        dto.seasonYear
      );
      if (conflict) {
        throw new ValidationError(
          'A game already exists for these teams on this date in this season'
        );
      }
    }

    const game = Game.create({
      seasonYear: dto.seasonYear,
      gameWeek: dto.gameWeek,
      preseason: dto.preseason,
      gameDate: dto.gameDate ? new Date(dto.gameDate) : undefined,
      homeTeamId: dto.homeTeamId,
      awayTeamId: dto.awayTeamId,
      gameLocation: dto.gameLocation,
      gameCity: dto.gameCity,
      gameStateProvince: dto.gameStateProvince,
      gameCountry: dto.gameCountry || 'USA',
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
      gameStatus: dto.gameStatus || 'scheduled',
    });

    return await this.gameRepository.save(game);
  }

  /**
   * Get game by ID
   * Repository now returns Game with team relations loaded
   */
  async getGameById(id: number): Promise<Game> {
    const game = await this.gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError('Game', id);
    }
    return game;
  }

  /**
   * Get all games with filters and pagination
   * Repository now returns Games with team relations loaded
   */
  async getAllGames(
    filters?: GameFiltersDto,
    pagination?: PaginationDto
  ): Promise<PaginatedResponse<Game>> {
    return await this.gameRepository.findAll(filters, pagination);
  }

  /**
   * Get preseason games
   * Repository now returns Games with team relations loaded
   */
  async getPreseasonGames(teamId?: number, preseasonWeek?: number): Promise<Game[]> {
    return await this.gameRepository.findPreseasonGames(teamId, preseasonWeek);
  }

  /**
   * Get regular season games
   * Repository now returns Games with team relations loaded
   */
  async getRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    return await this.gameRepository.findRegularSeasonGames(teamId, seasonYear);
  }

  /**
   * Get games for a specific team and season
   * Repository now returns Games with team relations loaded
   */
  async getTeamSeasonGames(teamId: number, seasonYear: string): Promise<Game[]> {
    return await this.gameRepository.findByTeamAndSeason(teamId, seasonYear);
  }

  /**
   * Get upcoming games
   * Repository now returns Games with team relations loaded
   */
  async getUpcomingGames(teamId?: number, limit?: number): Promise<Game[]> {
    return await this.gameRepository.findUpcomingGames(teamId, limit);
  }

  /**
   * Get completed games
   * Repository now returns Games with team relations loaded
   */
  async getCompletedGames(teamId?: number, limit?: number): Promise<Game[]> {
    return await this.gameRepository.findCompletedGames(teamId, limit);
  }

  /**
   * Update a game
   * Repository now returns Game with team relations loaded
   */
  async updateGame(id: number, dto: UpdateGameDto): Promise<Game> {
    const existingGame = await this.gameRepository.findById(id);
    if (!existingGame) {
      throw new NotFoundError('Game', id);
    }

    // Validate date conflict if date is being updated
    if (dto.gameDate) {
      const conflict = await this.gameRepository.checkGameConflict(
        existingGame.homeTeamId,
        existingGame.awayTeamId,
        new Date(dto.gameDate),
        existingGame.seasonYear
      );
      if (conflict) {
        const conflictGame = await this.gameRepository.findById(id);
        if (!conflictGame || conflictGame.id !== id) {
          throw new ValidationError(
            'A game already exists for these teams on this date in this season'
          );
        }
      }
    }

    const updatedGame = Game.create({
      id: existingGame.id,
      seasonYear: existingGame.seasonYear,
      gameWeek: dto.gameWeek ?? existingGame.gameWeek,
      preseason: dto.preseason ?? existingGame.preseason,
      gameDate: dto.gameDate ? new Date(dto.gameDate) : existingGame.gameDate,
      homeTeamId: existingGame.homeTeamId,
      awayTeamId: existingGame.awayTeamId,
      gameLocation: dto.gameLocation ?? existingGame.gameLocation,
      gameCity: dto.gameCity ?? existingGame.gameCity,
      gameStateProvince: dto.gameStateProvince ?? existingGame.gameStateProvince,
      gameCountry: dto.gameCountry ?? existingGame.gameCountry,
      homeScore: dto.homeScore ?? existingGame.homeScore,
      awayScore: dto.awayScore ?? existingGame.awayScore,
      gameStatus: (dto.gameStatus ?? existingGame.gameStatus) as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | undefined,
    });

    return await this.gameRepository.update(id, updatedGame);
  }

  /**
   * Update game score only
   * Repository now returns Game with team relations loaded
   */
  async updateGameScore(id: number, dto: UpdateScoreDto): Promise<Game> {
    const existingGame = await this.gameRepository.findById(id);
    if (!existingGame) {
      throw new NotFoundError('Game', id);
    }

    existingGame.updateScore(dto.homeScore, dto.awayScore, dto.gameStatus);

    return await this.gameRepository.update(id, existingGame);
  }

  /**
   * Delete a game
   */
  async deleteGame(id: number): Promise<void> {
    const exists = await this.gameRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('Game', id);
    }
    await this.gameRepository.delete(id);
  }

  /**
   * Get games for a team in a specific week
   * Repository now returns Games with team relations loaded
   */
  async getTeamWeekGames(
    teamId: number,
    seasonYear: string,
    gameWeek: number
  ): Promise<Game[]> {
    return await this.gameRepository.findByTeamSeasonWeek(teamId, seasonYear, gameWeek);
  }

  /**
   * Get all games for a season (preseason + regular + playoffs)
   * Repository now returns Games with team relations loaded
   */
  async getAllSeasonGames(teamId?: number, seasonYear?: string): Promise<Game[]> {
    return await this.gameRepository.findAllGamesForSeason(teamId, seasonYear);
  }
}