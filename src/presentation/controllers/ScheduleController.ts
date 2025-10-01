// src/presentation/controllers/ScheduleController.ts
import { Request, Response, NextFunction } from 'express';
import { ScheduleService } from '@/application/schedule/services/ScheduleService';
import { ApiResponse } from '@/shared/types/common';
import {
  ScheduleResponseDto,
  ScheduleFiltersDto,
  PaginationDto,
} from '@/application/schedule/dto/ScheduleDto';

export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  createSchedule = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const schedule = await this.scheduleService.createSchedule(req.body);
      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Schedule created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getScheduleById = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const schedule = await this.scheduleService.getScheduleById(id);
      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  // LIST (paginated)
  getAllSchedules = async (
    req: Request,
    res: Response<{ success: boolean; data: ScheduleResponseDto[]; pagination: any }>,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Let the client override; otherwise choose a larger sensible default than 10
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      const filters: ScheduleFiltersDto = {
        teamId: req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined,
        seasonYear: req.query.seasonYear ? parseInt(req.query.seasonYear as string, 10) : undefined,
        oppTeamId: req.query.oppTeamId ? parseInt(req.query.oppTeamId as string, 10) : undefined,
        oppTeamConference: req.query.oppTeamConference as string,
        oppTeamDivision: req.query.oppTeamDivision as string,
        scheduleWeek: req.query.scheduleWeek
          ? parseInt(req.query.scheduleWeek as string, 10)
          : undefined,
        gameCity: req.query.gameCity as string,
        gameStateProvince: req.query.gameStateProvince as string,
        gameCountry: req.query.gameCountry as string,
        wonLostFlag: req.query.wonLostFlag as string,
        homeOrAway: req.query.homeOrAway as string,
        completed: req.query.completed ? (req.query.completed as string) === 'true' : undefined,
      };

      const { data, pagination } = await this.scheduleService.getAllSchedules(filters, {
        page,
        limit,
      });

      // Many data tables look for this header for server-side pagination
      res.set('X-Total-Count', String(pagination.total));
      // Make sure browsers allow your frontend to read the header
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');

      res.json({
        success: true,
        data,
        pagination, // { page, limit, total, pages }
      });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const schedule = await this.scheduleService.updateSchedule(id, req.body);
      res.json({
        success: true,
        data: schedule,
        message: 'Schedule updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.scheduleService.deleteSchedule(id);
      res.status(204).json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // TEAM SEASON (paginated so the client can render a pager)
  getTeamSchedule = async (
    req: Request,
    res: Response<{
      success: boolean;
      data: ScheduleResponseDto[];
      pagination: any;
      message: string;
    }>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId, 10);
      const seasonYear = parseInt(req.params.seasonYear, 10);

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      const result = await this.scheduleService.getTeamSchedulePaginated(teamId, seasonYear, {
        page,
        limit,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: `Retrieved schedule for team ${teamId} in ${seasonYear}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getOpponentHistory = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const oppTeamId = parseInt(req.params.oppTeamId, 10);
      const schedules = await this.scheduleService.getOpponentHistory(oppTeamId);
      res.json({
        success: true,
        data: schedules,
        message: `Retrieved history against opponent team ${oppTeamId}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getUpcomingGames = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;
      const schedules = await this.scheduleService.getUpcomingGames(teamId);
      res.json({
        success: true,
        data: schedules,
        message: 'Retrieved upcoming games',
      });
    } catch (error) {
      next(error);
    }
  };

  getCompletedGames = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;
      const schedules = await this.scheduleService.getCompletedGames(teamId);
      res.json({
        success: true,
        data: schedules,
        message: 'Retrieved completed games',
      });
    } catch (error) {
      next(error);
    }
  };

  updateGameResult = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { teamScore, oppTeamScore, wonLostFlag } = req.body;
      const schedule = await this.scheduleService.updateGameResult(
        id,
        teamScore,
        oppTeamScore,
        wonLostFlag
      );
      res.json({
        success: true,
        data: schedule,
        message: 'Game result updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
