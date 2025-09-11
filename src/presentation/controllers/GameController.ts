// src/presentation/controllers/GameController.ts
import { Request, Response, NextFunction } from 'express';
import type { GameService } from '@/application/game/services/GameService';
import { ApiResponse } from '@/shared/types/common';
import {
  GameResponseDto,
  GameFiltersDto,
  PaginationDto,
  UpdateScoreDtoSchema,
} from '@/application/game/dto/GameDto';
import { z } from 'zod';
import { mapGameToResponse } from '@/application/game/dto/mapGameToResponse';

export class GameController {
  constructor(private readonly gameService: GameService) {}

  createGame = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    console.log('🔍 RAW req.body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 req.body.preseason:', req.body.preseason, typeof req.body.preseason);
    try {
      const game = await this.gameService.createGame(req.body);
      res.status(201).json({
        success: true,
        data: game,
        message: 'Game created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getGameById = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    console.log("presentation.controllers.GameController::getGamesByUd - Entrypoint");
    try {
      const id = z.coerce.number().parse(req.params.id);
      const game = await this.gameService.getGameById(id);
      res.json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllGames = async (
    req: Request,
    res: Response<{ success: boolean; data: GameResponseDto[]; pagination: any }>,
    next: NextFunction
  ): Promise<void> => {
    console.log("presentation.controllers.GameController::getAllGames - Entrypoint");
    type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
    const validStatuses: GameStatus[] = [
      'scheduled',
      'in_progress',
      'completed',
      'cancelled',
      'postponed',
    ];
    const rawStatus = req.query.gameStatus;

    try {
      const filters: GameFiltersDto = {
        seasonYear: req.query.seasonYear as string,
        gameWeek: req.query.gameWeek ? z.coerce.number().parse(req.query.gameWeek) : undefined,
        preseason: req.query.preseason ? z.coerce.number().parse(req.query.preseason) : undefined,
        homeTeamId: req.query.homeTeamId
          ? z.coerce.number().parse(req.query.homeTeamId)
          : undefined,
        awayTeamId: req.query.awayTeamId
          ? z.coerce.number().parse(req.query.awayTeamId)
          : undefined,
        teamId: req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined,
        gameStatus: validStatuses.includes(rawStatus as GameStatus)
          ? (rawStatus as GameStatus)
          : undefined,
        gameCity: req.query.gameCity as string,
        gameCountry: req.query.gameCountry as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? z.coerce.number().parse(req.query.page) : 1,
        limit: req.query.limit ? z.coerce.number().parse(req.query.limit) : 10,
      };

      const games = await this.gameService.getAllGames(filters, pagination);

      // Safe debug (avoid crash on empty list)
      if (games.data.length > 0) {
        const teamName = games.data[0].homeTeam ? games.data[0].homeTeam.name : 'isEmpty';
        console.log('GameController.getAllGames - homeTeam:', teamName);
      } else {
        console.log('GameController.getAllGames - no games returned.');
      }

      res.json({
        success: true,
        data: games.data,
        pagination: games.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getPreseasonGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    console.log("presentation.controllers.GameController::getPreSeasonGames - Entrypoint");
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const preseasonWeek = req.query.preseasonWeek
        ? z.coerce.number().parse(req.query.preseasonWeek)
        : undefined;
      const games = await this.gameService.getPreseasonGames(teamId, preseasonWeek);
      res.json({
        success: true,
        data: games,
      });
    } catch (error) {
      next(error);
    }
  };

  getRegularSeasonGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    console.log("presentation.controllers.GameController::getRegularSeasonGames - Entrypoint");
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const seasonYear = req.query.seasonYear as string;
      const games = await this.gameService.getRegularSeasonGames(teamId, seasonYear);
      res.json({
        success: true,
        data: games,
      });
    } catch (error) {
      next(error);
    }
  };
    /**
   * GET /teams/:teamId/games?seasonYear=YYYY
   * Returns games for a team+season with team relations for names/logos.
   */
  getTeamGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    console.log("presentation.controllers.GameController::getTeamGames - Entrypoint");
    try {
      // ✅ use params, not query
      const teamId = z.coerce.number().parse(req.params.teamId);
      const seasonYear = z
        .string()
        .regex(/^\d{4}$/)
        .parse(req.params.seasonYear);

      // ✅ service still returns Game[] (domain entities)
      const games = await this.gameService.getTeamSeasonGames(teamId, seasonYear);

      // ✅ convert to DTOs
      const dtoGames = games.map(mapGameToResponse);

      res.json({
        success: true,
        data: dtoGames,
      });
    } catch (error) {
      next(error);
    }
  };

  updateGame = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const game = await this.gameService.updateGame(id, req.body);
      res.json({
        success: true,
        data: game,
        message: 'Game updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /games/:id/score
   * Accepts only { homeScore, awayScore, gameStatus? } as per UpdateScoreDtoSchema.
   */
  updateGameScore = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = z.coerce.number().parse(req.params.id);

      // Validate payload strictly against UpdateScoreDtoSchema
      const parsed = UpdateScoreDtoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid score update payload',
          errors: parsed.error.issues,
        } as any);
        return;
      }

      const game = await this.gameService.updateGameScore(id, parsed.data);
      res.json({
        success: true,
        data: game,
        message: 'Game score updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteGame = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      await this.gameService.deleteGame(id);
      res.status(204).json({
        success: true,
        message: 'Game deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };


  getUpcomingGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const limit = req.query.limit ? z.coerce.number().parse(req.query.limit) : undefined;
      const games = await this.gameService.getUpcomingGames(teamId, limit);
      res.json({
        success: true,
        data: games,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompletedGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const limit = req.query.limit ? z.coerce.number().parse(req.query.limit) : undefined;
      const games = await this.gameService.getCompletedGames(teamId, limit);
      res.json({
        success: true,
        data: games,
      });
    } catch (error) {
      next(error);
    }
  };
}
