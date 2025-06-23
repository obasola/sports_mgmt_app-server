
// Controller

// src/presentation/controllers/GameController.ts
import { Request, Response, NextFunction } from 'express';
import type{ GameService } from '@/application/game/services/GameService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { GameResponseDto, GameFiltersDto, PaginationDto } from '@/application/game/dto/GameDto';

export class GameController {
  constructor(private readonly gameService: GameService) {}

  createGame = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    console.log("🔍 RAW req.body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 req.body.preseason:", req.body.preseason, typeof req.body.preseason);    
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
    try {
      const id = parseInt(req.params.id);
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
    res: Response<{success:boolean, data: GameResponseDto[],pagination: any}>,
    next: NextFunction
  ): Promise<void> => {

    type GameStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";

    const validStatuses: GameStatus[] = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
    "postponed",
    ]; 
    const rawStatus = req.query.gameStatus;   
    try {
      const filters: GameFiltersDto = {
        seasonYear: req.query.seasonYear as string,
        gameWeek: req.query.gameWeek ? parseInt(req.query.gameWeek as string) : undefined,
        preseason: req.query.preseason ? parseInt(req.query.preseason as string) : undefined, // ✅ ADD THIS
        homeTeamId: req.query.homeTeamId ? parseInt(req.query.homeTeamId as string) : undefined,
        awayTeamId: req.query.awayTeamId ? parseInt(req.query.awayTeamId as string) : undefined,
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        gameStatus: validStatuses.includes(rawStatus as GameStatus) ? (rawStatus as GameStatus) : undefined,
        gameCity: req.query.gameCity as string,
        gameCountry: req.query.gameCountry as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const games = await this.gameService.getAllGames(filters, pagination);
      let teamName = games.data[0].homeTeam ? games.data[0].homeTeam.name : 'isEmpty';
      console.log("GameController.getAllGames - homeTeam: "+ teamName);
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
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const preseasonWeek = req.query.preseasonWeek ? parseInt(req.query.preseasonWeek as string) : undefined;
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
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
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


  updateGame = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
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

  updateGameScore = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const game = await this.gameService.updateGameScore(id, req.body);
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
      const id = parseInt(req.params.id);
      await this.gameService.deleteGame(id);
      res.status(204).json({
        success: true,
        message: 'Game deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamGames = async (
    req: Request,
    res: Response<ApiResponse<GameResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonYear = req.params.seasonYear;
      const games = await this.gameService.getTeamGames(teamId, seasonYear);
      res.json({
        success: true,
        data: games,
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
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
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
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
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