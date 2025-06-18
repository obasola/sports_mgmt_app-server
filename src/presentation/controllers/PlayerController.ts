// src/presentation/controllers/PlayerController.ts
import { Request, Response, NextFunction } from 'express';
import { PlayerService } from '@/application/player/services/PlayerService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { 
  PlayerResponseDto, 
  PlayerFiltersDto, 
  PaginationDto,
  PlayerStatisticsDto,
  PositionStatisticsDto,
  PlayerSearchDto,
  PlayerPhysicalRangeDto,
  PlayerBulkUpdateDto
} from '@/application/player/dto/PlayerDto';

export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  createPlayer = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const player = await this.playerService.createPlayer(req.body);
      res.status(201).json({
        success: true,
        data: player,
        message: 'Player created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerById = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const player = await this.playerService.getPlayerById(id);
      res.json({
        success: true,
        data: player,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPlayers = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<PlayerResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: PlayerFiltersDto = {
        firstName: req.query.firstName as string,
        lastName: req.query.lastName as string,
        position: req.query.position as string,
        university: req.query.university as string,
        status: req.query.status as string,
        homeState: req.query.homeState as string,
        homeCity: req.query.homeCity as string,
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        minHeight: req.query.minHeight ? parseInt(req.query.minHeight as string) : undefined,
        maxHeight: req.query.maxHeight ? parseInt(req.query.maxHeight as string) : undefined,
        minWeight: req.query.minWeight ? parseInt(req.query.minWeight as string) : undefined,
        maxWeight: req.query.maxWeight ? parseInt(req.query.maxWeight as string) : undefined,
        yearEnteredLeague: req.query.yearEnteredLeague ? parseInt(req.query.yearEnteredLeague as string) : undefined,
        prospectId: req.query.prospectId ? parseInt(req.query.prospectId as string) : undefined,
        search: req.query.search as string,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const players = await this.playerService.getAllPlayers(filters, pagination);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePlayer = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const player = await this.playerService.updatePlayer(id, req.body);
      res.json({
        success: true,
        data: player,
        message: 'Player updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePlayer = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.playerService.deletePlayer(id);
      res.status(204).json({
        success: true,
        message: 'Player deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Search and filter endpoints
  searchPlayers = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const searchDto: PlayerSearchDto = {
        query: req.query.query as string,
        position: req.query.position as string,
        university: req.query.university as string,
        status: req.query.status as string,
      };

      const players = await this.playerService.searchPlayers(searchDto);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByPosition = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const position = req.params.position;
      const players = await this.playerService.getPlayersByPosition(position);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByUniversity = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const university = req.params.university;
      const players = await this.playerService.getPlayersByUniversity(university);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerByProspectId = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto | null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const prospectId = parseInt(req.params.prospectId);
      const player = await this.playerService.getPlayerByProspectId(prospectId);
      res.json({
        success: true,
        data: player,
      });
    } catch (error) {
      next(error);
    }
  };

  getRookies = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const players = await this.playerService.getRookies();
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getVeterans = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const minYears = req.query.minYears ? parseInt(req.query.minYears as string) : undefined;
      const players = await this.playerService.getVeterans(minYears);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByYearEnteredLeague = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const year = parseInt(req.params.year);
      const players = await this.playerService.getPlayersByYearEnteredLeague(year);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByStatus = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = req.params.status;
      const players = await this.playerService.getPlayersByStatus(status);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByLocation = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const city = req.query.city as string;
      const state = req.query.state as string;
      const players = await this.playerService.getPlayersByLocation(city, state);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayersByPhysicalRange = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rangeDto: PlayerPhysicalRangeDto = {
        minHeight: req.query.minHeight ? parseInt(req.query.minHeight as string) : undefined,
        maxHeight: req.query.maxHeight ? parseInt(req.query.maxHeight as string) : undefined,
        minWeight: req.query.minWeight ? parseInt(req.query.minWeight as string) : undefined,
        maxWeight: req.query.maxWeight ? parseInt(req.query.maxWeight as string) : undefined,
      };

      const players = await this.playerService.getPlayersByPhysicalRange(rangeDto);
      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  };

  // Statistics endpoints
  getPlayerStatistics = async (
    req: Request,
    res: Response<ApiResponse<PlayerStatisticsDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const statistics = await this.playerService.getPlayerStatistics();
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };

  getPositionStatistics = async (
    req: Request,
    res: Response<ApiResponse<PositionStatisticsDto | null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const position = req.params.position;
      const statistics = await this.playerService.getPositionStatistics(position);
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };

  // Bulk operations
  bulkUpdatePlayers = async (
    req: Request,
    res: Response<ApiResponse<PlayerResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const bulkUpdateDto: PlayerBulkUpdateDto = req.body;
      const updatedPlayers = await this.playerService.bulkUpdatePlayers(bulkUpdateDto);
      res.json({
        success: true,
        data: updatedPlayers,
        message: `Successfully updated ${updatedPlayers.length} players`,
      });
    } catch (error) {
      next(error);
    }
  };
}