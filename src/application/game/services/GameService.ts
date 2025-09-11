import { z } from 'zod'
import { IGameRepository } from '@/domain/game/repositories/IGameRepository';
import { Game } from '@/domain/game/entities/Game';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateGameDto,
  UpdateGameDto,
  GameFiltersDto,
  GameResponseDto,
  UpdateScoreDto,
} from '../dto/GameDto';
import { mapGameToResponse } from '../dto/mapGameToResponse'   // ← add this

export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}

  async createGame(dto: CreateGameDto): Promise<GameResponseDto> {
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

    const saved = await this.gameRepository.save(game);
    return mapGameToResponse(saved);            // ← use mapper
  }

  async getGameById(id: number): Promise<GameResponseDto> {
    console.log("application.game.GameService::getGameById - Getting Game by UD: "+id);
    const result = await this.gameRepository.findByIdWithTeams(id);
    if (!result) throw new NotFoundError('Game', id);

    const { game } = result; // relations already merged in entity by fromPersistence
    return mapGameToResponse(game);             // ← use mapper
  }

  async getTeamSeasonGames(teamId: number, seasonYear: string) {
    return this.gameRepository.findByTeamAndSeason(teamId, seasonYear);
  }

  async getPreseasonGames(teamId?: number, seasonYear?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findPreseasonGames(teamId, seasonYear);
    return games.map(mapGameToResponse);        // ← use mapper
  }

  async getRegularSeasonGames(teamId?: number, seasonYear?: string): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findRegularSeasonGames(teamId, seasonYear);
    return games.map(mapGameToResponse);        // ← use mapper
  }

  async getAllGamesForSeason(teamId?: number, seasonYear?: string): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findRegularSeasonGames(teamId, seasonYear);
    return games.map(mapGameToResponse);        // ← use mapper
  }

  async getAllGames(
    filters?: GameFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<GameResponseDto>> {
    const result = await this.gameRepository.findAll(filters, pagination);
    return {
      data: result.data.map(mapGameToResponse), // ← use mapper
      pagination: result.pagination,
    };
  }

  async updateGame(id: number, dto: UpdateGameDto): Promise<GameResponseDto> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) throw new NotFoundError('Game', id);

    const updated = Game.create({
      id: existing.id,
      seasonYear: existing.seasonYear,
      homeTeamId: existing.homeTeamId,
      awayTeamId: existing.awayTeamId,
      gameWeek: dto.gameWeek ?? existing.gameWeek,
      preseason: dto.preseason ?? existing.preseason,
      gameDate: dto.gameDate ?? existing.gameDate,
      gameLocation: dto.gameLocation ?? existing.gameLocation,
      gameCity: dto.gameCity ?? existing.gameCity,
      gameStateProvince: dto.gameStateProvince ?? existing.gameStateProvince,
      gameCountry: dto.gameCountry ?? existing.gameCountry,
      homeScore: dto.homeScore ?? existing.homeScore,
      awayScore: dto.awayScore ?? existing.awayScore,
      gameStatus: dto.gameStatus ?? existing.gameStatus,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const saved = await this.gameRepository.update(id, updated);
    return mapGameToResponse(saved);            // ← use mapper
  }

  async updateGameScore(id: number, dto: UpdateScoreDto): Promise<GameResponseDto> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) throw new NotFoundError('Game', id);

    if (existing.gameStatus === 'cancelled' || existing.gameStatus === 'postponed') {
      throw new ValidationError('Cannot update score for cancelled or postponed games');
    }

    existing.updateScore(dto.homeScore, dto.awayScore);
    if (dto.gameStatus) existing.updateStatus(dto.gameStatus);

    const saved = await this.gameRepository.update(id, existing);
    return mapGameToResponse(saved);            // ← use mapper
  }

  async deleteGame(id: number): Promise<void> {
    const game = await this.gameRepository.findById(id);
    if (!game) throw new NotFoundError('Game', id);
    await this.gameRepository.delete(id);
  }

  async gameExists(id: number): Promise<boolean> {
    return this.gameRepository.exists(id);
  }

  async getTeamGames(teamId: number, seasonYear: string): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findByTeamAndSeason(teamId, seasonYear);
    return games.map(mapGameToResponse);        // ← use mapper
  }

  async getUpcomingGames(teamId?: number, limit?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findUpcomingGames(teamId, limit);
    return games.map(mapGameToResponse);        // ← use mapper
  }

  async getCompletedGames(teamId?: number, limit?: number): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findCompletedGames(teamId, limit);
    return games.map(mapGameToResponse);        // ← use mapper
  }
}
