// src/presentation/controllers/TeamNeedController.ts
import { Request, Response, NextFunction } from 'express';
import { TeamNeedService } from '@/application/teamNeed/services/TeamNeedService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { TeamNeedResponseDto, TeamNeedFiltersDto, PaginationDto } from '@/application/teamNeed/dto/TeamNeedDto';

export class TeamNeedController {
  constructor(private readonly teamNeedService: TeamNeedService) {}

  createTeamNeed = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamNeed = await this.teamNeedService.createTeamNeed(req.body);
      res.status(201).json({
        success: true,
        data: teamNeed,
        message: 'Team need created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamNeedById = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const teamNeed = await this.teamNeedService.getTeamNeedById(id);
      res.json({
        success: true,
        data: teamNeed,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllTeamNeeds = async (
    req: Request,
    res: Response<{success: boolean, data: TeamNeedResponseDto[], pagination: any}>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: TeamNeedFiltersDto = {
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        position: req.query.position as string,
        priority: req.query.priority ? parseInt(req.query.priority as string) : undefined,
        draftYear: req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const teamNeeds = await this.teamNeedService.getAllTeamNeeds(filters, pagination);
      res.json({
        success: true,
        data: teamNeeds.data,
        pagination: teamNeeds.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  updateTeamNeed = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const teamNeed = await this.teamNeedService.updateTeamNeed(id, req.body);
      res.json({
        success: true,
        data: teamNeed,
        message: 'Team need updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTeamNeed = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.teamNeedService.deleteTeamNeed(id);
      res.status(204).json({
        success: true,
        message: 'Team need deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Domain-specific endpoints
  getTeamNeeds = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const teamNeeds = await this.teamNeedService.getTeamNeeds(teamId);
      res.json({
        success: true,
        data: teamNeeds,
      });
    } catch (error) {
      next(error);
    }
  };

  getHighPriorityNeeds = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const teamNeeds = await this.teamNeedService.getHighPriorityNeeds(teamId);
      res.json({
        success: true,
        data: teamNeeds,
      });
    } catch (error) {
      next(error);
    }
  };

  getNeedsByPosition = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const position = req.params.position;
      const teamNeeds = await this.teamNeedService.getNeedsByPosition(position);
      res.json({
        success: true,
        data: teamNeeds,
      });
    } catch (error) {
      next(error);
    }
  };

  getNeedsByDraftYear = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const teamNeeds = await this.teamNeedService.getNeedsByDraftYear(draftYear);
      res.json({
        success: true,
        data: teamNeeds,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTeamNeedPriority = async (
    req: Request,
    res: Response<ApiResponse<TeamNeedResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { priority } = req.body;
      const teamNeed = await this.teamNeedService.updateTeamNeedPriority(id, priority);
      res.json({
        success: true,
        data: teamNeed,
        message: 'Team need priority updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}