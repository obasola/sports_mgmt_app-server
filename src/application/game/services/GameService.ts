// Application Service
// src/application/game/services/GameService.ts
import { IGameRepository } from '@/domain/game/repositories/IGameRepository';
import { Game } from '@/domain/game/entities/Game';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateGameDto,
  UpdateGameDto,
  GameFiltersDto,
  GameResponseDto,
  UpdateScoreDto,
} from '../dto/GameDto';

export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}

  // ✅ UPDATED: Create game (simple - no relations needed)
  async createGame(dto: CreateGameDto): Promise<GameResponseDto> {
    console.log('🔍 Service received:', JSON.stringify(dto, null, 2));

    try {
      console.log('🔍 Creating Game entity...');
      const game = Game.create({
        seasonYear: dto.seasonYear,
        gameWeek: dto.gameWeek,
        preseason: dto.preseason,
        gameDate: dto.gameDate,
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
      console.log('✅ Game entity created successfully');

      console.log('🔍 Saving to repository...');
      const savedGame = await this.gameRepository.save(game);
      console.log('✅ Game saved successfully');

      // Return without teams for create (can add teams later if needed)
      return this.toResponseDto(savedGame);
    } catch (error: any) {
      console.error('❌ Service error:', error.message);
      throw error;
    }
  }

  async getGameById(id: number): Promise<GameResponseDto> {
    const result = await this.gameRepository.findByIdWithTeams(id);
    if (!result) {
      throw new NotFoundError('Game', id);
    }

    // ✅ CORRECT: Now this destructuring works because result has these properties
    const { game, homeTeam, awayTeam } = result;
    return this.toResponseDto(game, homeTeam, awayTeam);
  }

  async getPreseasonGames(teamId?: number, seasonYear?: number, preseasonWeek?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findPreseasonGames(teamId, seasonYear, preseasonWeek);
    return games.map((game) => this.toResponseDto(game));
  }

  async getRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findRegularSeasonGames(teamId, seasonYear);
    return games.map((game) => this.toResponseDto(game));
  }

  async getAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findRegularSeasonGames(teamId, seasonYear);
    return games.map((game) => this.toResponseDto(game));
  }

  async getAllGames(
    filters?: GameFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<GameResponseDto>> {
    const result = await this.gameRepository.findAll(filters, pagination);
    console.log('Service - getAllGames called which calls toResponseDto');
    let teamName = result.data[0].homeTeam ? result.data[0].homeTeam.name : 'isEmpty';
    console.log('Service - homeTeam: ' + teamName);
    return {
      data: result.data.map((game) =>
        this.toResponseWithRelationsDto(game, game.homeTeam, game.awayTeam)
      ),
      pagination: result.pagination,
    };
  }

  async updateGame(id: number, dto: UpdateGameDto): Promise<GameResponseDto> {
    const existingGame = await this.gameRepository.findById(id);
    if (!existingGame) {
      throw new NotFoundError('Game', id);
    }

    // Create updated game with preserved required fields
    const updatedGame = Game.create({
      id: existingGame.id,
      seasonYear: existingGame.seasonYear,
      homeTeamId: existingGame.homeTeamId,
      awayTeamId: existingGame.awayTeamId,
      gameWeek: dto.gameWeek !== undefined ? dto.gameWeek : existingGame.gameWeek,
      preseason: dto.preseason !== undefined ? dto.preseason : existingGame.preseason,
      gameDate: dto.gameDate !== undefined ? dto.gameDate : existingGame.gameDate,
      gameLocation: dto.gameLocation !== undefined ? dto.gameLocation : existingGame.gameLocation,
      gameCity: dto.gameCity !== undefined ? dto.gameCity : existingGame.gameCity,
      gameStateProvince:
        dto.gameStateProvince !== undefined
          ? dto.gameStateProvince
          : existingGame.gameStateProvince,
      gameCountry: dto.gameCountry !== undefined ? dto.gameCountry : existingGame.gameCountry,
      homeScore: dto.homeScore !== undefined ? dto.homeScore : existingGame.homeScore,
      awayScore: dto.awayScore !== undefined ? dto.awayScore : existingGame.awayScore,
      gameStatus: dto.gameStatus !== undefined ? dto.gameStatus : existingGame.gameStatus,
      createdAt: existingGame.createdAt,
      updatedAt: new Date(),
    });

    const savedGame = await this.gameRepository.update(id, updatedGame);
    return this.toResponseDto(savedGame);
  }

  async updateGameScore(id: number, dto: UpdateScoreDto): Promise<GameResponseDto> {
    const existingGame = await this.gameRepository.findById(id);
    if (!existingGame) {
      throw new NotFoundError('Game', id);
    }

    // Validate that game can have score updated
    if (existingGame.gameStatus === 'cancelled' || existingGame.gameStatus === 'postponed') {
      throw new ValidationError('Cannot update score for cancelled or postponed games');
    }

    // Update score using business method
    existingGame.updateScore(dto.homeScore, dto.awayScore);

    if (dto.gameStatus) {
      existingGame.updateStatus(dto.gameStatus);
    }

    const updatedGame = await this.gameRepository.update(id, existingGame);
    return this.toResponseDto(updatedGame);
  }

  async deleteGame(id: number): Promise<void> {
    const game = await this.gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError('Game', id);
    }

    await this.gameRepository.delete(id);
  }

  async gameExists(id: number): Promise<boolean> {
    return this.gameRepository.exists(id);
  }

  async getTeamGames(teamId: number, seasonYear: string): Promise<GameResponseDto[]> {
    console.log('getTeamGames called which calls toResponseDto');
    const games = await this.gameRepository.findByTeamAndSeason(teamId, seasonYear);
    return games.map((game) => this.toResponseDto(game));
  }

  async getUpcomingGames(teamId?: number, limit?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findUpcomingGames(teamId, limit);
    return games.map((game) => this.toResponseDto(game));
  }

  async getCompletedGames(teamId?: number, limit?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findCompletedGames(teamId, limit);
    return games.map((game) => this.toResponseDto(game));
  }

  // ✅ UPDATED: Handle teams in response conversion
  private toResponseDto(game: Game, homeTeam?: any, awayTeam?: any): GameResponseDto {
    const gameData = game.toPlainObject();
    return {
      id: game.id!,
      seasonYear: game.seasonYear!,
      gameWeek: game.gameWeek,
      preseason: game.preseason,
      gameDate: game.gameDate?.toISOString(),
      homeTeamId: game.homeTeamId!,
      awayTeamId: game.awayTeamId!,
      gameLocation: game.gameLocation,
      gameCity: game.gameCity,
      gameStateProvince: game.gameStateProvince,
      gameCountry: game.gameCountry,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      gameStatus: game.gameStatus,
      fullLocation: this.getFullLocation(game),
      winningTeamId: game.getWinningTeamId(),
      isTie: game.isTie(),
      createdAt: game.createdAt?.toISOString(),
      updatedAt: game.updatedAt?.toISOString(),
      homeTeam: homeTeam
        ? {
            id: homeTeam.id,
            name: homeTeam.name,
            city: homeTeam.city,
            state: homeTeam.state,
            conference: homeTeam.conference,
            division: homeTeam.division,
            stadium: homeTeam.stadium,
          }
        : undefined,
      awayTeam: awayTeam
        ? {
            id: awayTeam.id,
            name: awayTeam.name,
            city: awayTeam.city,
            state: awayTeam.state,
            conference: awayTeam.conference,
            division: awayTeam.division,
            stadium: awayTeam.stadium,
          }
        : undefined,
    };
  }
  private toResponseWithRelationsDto(game: Game, homeTeam?: any, awayTeam?: any): GameResponseDto {
    const gameData = game.toPlainObject();
    if (gameData.awayTeam === undefined || gameData.awayTeam === null) {
      if (game.awayTeamId) {
        awayTeam = this.gameRepository.findById(game.awayTeamId);
      }
    }
    if (gameData.homeTeam === undefined || gameData.homeTeam === null) {
      if (game.homeTeamId) {
        homeTeam = this.gameRepository.findById(game.homeTeamId);
      }
    }
    return {
      id: game.id!,
      seasonYear: game.seasonYear!,
      gameWeek: game.gameWeek,
      preseason: game.preseason,
      gameDate: game.gameDate?.toISOString(),
      homeTeamId: game.homeTeamId!,
      awayTeamId: game.awayTeamId!,
      gameLocation: game.gameLocation,
      gameCity: game.gameCity,
      gameStateProvince: game.gameStateProvince,
      gameCountry: game.gameCountry,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      gameStatus: game.gameStatus,
      fullLocation: this.getFullLocation(game),
      winningTeamId: game.getWinningTeamId(),
      isTie: game.isTie(),
      createdAt: game.createdAt?.toISOString(),
      updatedAt: game.updatedAt?.toISOString(),
      homeTeam: homeTeam
        ? {
            id: homeTeam.id,
            name: homeTeam.name,
            city: homeTeam.city,
            state: homeTeam.state,
            conference: homeTeam.conference,
            division: homeTeam.division,
            stadium: homeTeam.stadium,
          }
        : undefined,
      awayTeam: awayTeam
        ? {
            id: awayTeam.id,
            name: awayTeam.name,
            city: awayTeam.city,
            state: awayTeam.state,
            conference: awayTeam.conference,
            division: awayTeam.division,
            stadium: awayTeam.stadium,
          }
        : undefined,
    };
  }

  private getFullLocation(game: Game): string {
    const parts = [
      game.gameLocation,
      game.gameCity,
      game.gameStateProvince,
      game.gameCountry,
    ].filter((part) => part && part.trim().length > 0);

    return parts.join(', ');
  }
}
