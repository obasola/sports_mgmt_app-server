
// src/presentation/controllers/PlayerAwardController.ts

import { Request, Response, NextFunction } from 'express';
import { PlayerAwardService } from '@/application/playerAward/services/PlayerAwardService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { PlayerAwardResponseDto, PlayerAwardFiltersDto, PaginationDto } from '@/application/playerAward/dto/PlayerAwardDto';

export class PlayerAwardController {
  constructor(private readonly playerAwardService: PlayerAwardService) {}

  createPlayerAward = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerAward = await this.playerAwardService.createPlayerAward(req.body);
      res.status(201).json({
        success: true,
        data: playerAward,
        message: 'Player award created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerAwardById = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const playerAward = await this.playerAwardService.getPlayerAwardById(id);
      res.json({
        success: true,
        data: playerAward,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPlayerAwards = async (
    req: Request,
    res: Response<{success:boolean, data: PlayerAwardResponseDto[], pagination: any}>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: PlayerAwardFiltersDto = {
        playerId: req.query.playerId ? parseInt(req.query.playerId as string) : undefined,
        awardName: req.query.awardName as string,
        yearAwarded: req.query.yearAwarded ? parseInt(req.query.yearAwarded as string) : undefined,
        yearFrom: req.query.yearFrom ? parseInt(req.query.yearFrom as string) : undefined,
        yearTo: req.query.yearTo ? parseInt(req.query.yearTo as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const playerAwards = await this.playerAwardService.getAllPlayerAwards(filters, pagination);
      res.json({
        success: true,
        data: playerAwards.data,
        pagination: playerAwards.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePlayerAward = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const playerAward = await this.playerAwardService.updatePlayerAward(id, req.body);
      res.json({
        success: true,
        data: playerAward,
        message: 'Player award updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePlayerAward = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.playerAwardService.deletePlayerAward(id);
      res.status(204).json({
        success: true,
        message: 'Player award deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerAwardsByPlayerId = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerId = parseInt(req.params.playerId);
      const playerAwards = await this.playerAwardService.getPlayerAwardsByPlayerId(playerId);
      res.json({
        success: true,
        data: playerAwards,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerAwardsByAwardName = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const awardName = req.params.awardName;
      const playerAwards = await this.playerAwardService.getPlayerAwardsByAwardName(awardName);
      res.json({
        success: true,
        data: playerAwards,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerAwardsByYear = async (
    req: Request,
    res: Response<ApiResponse<PlayerAwardResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const year = parseInt(req.params.year);
      const playerAwards = await this.playerAwardService.getPlayerAwardsByYear(year);
      res.json({
        success: true,
        data: playerAwards,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerAwardCount = async (
    req: Request,
    res: Response<ApiResponse<{ count: number }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerId = parseInt(req.params.playerId);
      const count = await this.playerAwardService.getPlayerAwardCount(playerId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };
}