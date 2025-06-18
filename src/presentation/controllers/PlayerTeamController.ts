// src/presentation/controllers/PlayerTeamController.ts
import { Request, Response, NextFunction } from 'express';
import { PlayerTeamService } from '@/application/playerTeam/services/PlayerTeamService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { PlayerTeamResponseDto, PlayerTeamFiltersDto, PaginationDto } from '@/application/playerTeam/dto/PlayerTeamDto';

export class PlayerTeamController {
  constructor(private readonly playerTeamService: PlayerTeamService) {}

  createPlayerTeam = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerTeam = await this.playerTeamService.createPlayerTeam(req.body);
      res.status(201).json({
        success: true,
        data: playerTeam,
        message: 'PlayerTeam created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayerTeamById = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const playerTeam = await this.playerTeamService.getPlayerTeamById(id);
      res.json({
        success: true,
        data: playerTeam,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPlayerTeams = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<PlayerTeamResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: PlayerTeamFiltersDto = {
        playerId: req.query.playerId ? parseInt(req.query.playerId as string) : undefined,
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        jerseyNumber: req.query.jerseyNumber ? parseInt(req.query.jerseyNumber as string) : undefined,
        currentTeam: req.query.currentTeam ? req.query.currentTeam === 'true' : undefined,
        contractValue: req.query.contractValue ? parseInt(req.query.contractValue as string) : undefined,
        contractLength: req.query.contractLength ? parseInt(req.query.contractLength as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const playerTeams = await this.playerTeamService.getAllPlayerTeams(filters, pagination);
      res.json({
        success: true,
        data: playerTeams,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePlayerTeam = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const playerTeam = await this.playerTeamService.updatePlayerTeam(id, req.body);
      res.json({
        success: true,
        data: playerTeam,
        message: 'PlayerTeam updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePlayerTeam = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.playerTeamService.deletePlayerTeam(id);
      res.status(204).json({
        success: true,
        message: 'PlayerTeam deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Domain-specific endpoints
  getPlayerHistory = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerId = parseInt(req.params.playerId);
      const history = await this.playerTeamService.getPlayerHistory(playerId);
      res.json({
        success: true,
        data: history,
        message: 'Player history retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamRoster = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const currentOnly = req.query.currentOnly === 'true';
      const roster = await this.playerTeamService.getTeamRoster(teamId, currentOnly);
      res.json({
        success: true,
        data: roster,
        message: 'Team roster retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentTeamForPlayer = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto | null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerId = parseInt(req.params.playerId);
      const currentTeam = await this.playerTeamService.getCurrentTeamForPlayer(playerId);
      res.json({
        success: true,
        data: currentTeam,
        message: currentTeam ? 'Current team found' : 'No current team found',
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentTeamContracts = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentContracts = await this.playerTeamService.getCurrentTeamContracts();
      res.json({
        success: true,
        data: currentContracts,
        message: 'Current team contracts retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  checkJerseyNumberAvailability = async (
    req: Request,
    res: Response<ApiResponse<{ available: boolean }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const jerseyNumber = parseInt(req.params.jerseyNumber);
      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;
      
      const available = await this.playerTeamService.checkJerseyNumberAvailability(
        teamId,
        jerseyNumber,
        excludeId
      );
      
      res.json({
        success: true,
        data: { available },
        message: available ? 'Jersey number is available' : 'Jersey number is taken',
      });
    } catch (error) {
      next(error);
    }
  };

  transferPlayer = async (
    req: Request,
    res: Response<ApiResponse<PlayerTeamResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const playerId = parseInt(req.params.playerId);
      const { newTeamId, ...transferData } = req.body;
      
      const newContract = await this.playerTeamService.transferPlayer(
        playerId,
        newTeamId,
        transferData
      );
      
      res.json({
        success: true,
        data: newContract,
        message: 'Player transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}