// src/presentation/controllers/GameController.ts
import { Request, Response, NextFunction } from 'express';
import type { GameService } from '@/application/game/services/GameService';
import { ApiResponse } from '@/shared/types/common';
import { GameResponseDto, UpdateScoreDtoSchema } from '@/application/game/dto/GameDto';
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
      const dto = mapGameToResponse(game);
      res.status(201).json({
        success: true,
        data: dto,
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
    console.log('presentation.controllers.GameController::getGameById - Entrypoint');
    try {
      const id = z.coerce.number().parse(req.params.id);
      const game = await this.gameService.getGameById(id);
      const dto = mapGameToResponse(game);
      res.json({
        success: true,
        data: dto,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllGames = async (req: Request, res: Response<any>, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      const { data, pagination } = await this.gameService.getAllGames(req.query as any, {
        page,
        limit,
      });

      const dtoGames = data.map(mapGameToResponse);

      res.set('X-Total-Count', String(pagination.total));
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');

      res.json({ success: true, data: dtoGames, pagination });
    } catch (err) {
      next(err);
    }
  };

  getPreseasonGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    console.log('presentation.controllers.GameController::getPreseasonGames - Entrypoint');
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const preseasonWeek = req.query.preseasonWeek
        ? z.coerce.number().parse(req.query.preseasonWeek)
        : undefined;
      const games = await this.gameService.getPreseasonGames(teamId, preseasonWeek);
      const dtoGames = games.map(mapGameToResponse);
      res.json({
        success: true,
        data: dtoGames,
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
    console.log('presentation.controllers.GameController::getRegularSeasonGames - Entrypoint');
    try {
      const teamId = req.query.teamId ? z.coerce.number().parse(req.query.teamId) : undefined;
      const seasonYear = req.query.seasonYear as string;
      const games = await this.gameService.getRegularSeasonGames(teamId, seasonYear);
      const dtoGames = games.map(mapGameToResponse);
      res.json({
        success: true,
        data: dtoGames,
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
    console.log('presentation.controllers.GameController::getTeamGames - Entrypoint');
    try {
      const teamId = z.coerce.number().parse(req.params.teamId);
      const seasonYear = z
        .string()
        .regex(/^\d{4}$/)
        .parse(req.params.seasonYear);

      // Service now returns Game[] with team relations already loaded
      const games = await this.gameService.getTeamSeasonGames(teamId, seasonYear);

      // Convert to DTOs
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
      const dto = mapGameToResponse(game);
      res.json({
        success: true,
        data: dto,
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
      const dto = mapGameToResponse(game);
      res.json({
        success: true,
        data: dto,
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
      const dtoGames = games.map(mapGameToResponse);
      res.json({
        success: true,
        data: dtoGames,
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
      const dtoGames = games.map(mapGameToResponse);
      res.json({
        success: true,
        data: dtoGames,
      });
    } catch (error) {
      next(error);
    }
  };

  
 /****************************************************************
  * Calculate conference record for a team in a season
  *  (new methods added for Team Info Statistics)
  ****************************************************************/

  getTeamStatistics = async (
    req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = z.coerce.number().parse(req.params.teamId);
      const seasonYear = z
        .string()
        .regex(/^\d{4}$/)
        .parse(req.query.seasonYear || new Date().getFullYear().toString());

      const stats = await this.gameService.getTeamStatistics(teamId, seasonYear);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
