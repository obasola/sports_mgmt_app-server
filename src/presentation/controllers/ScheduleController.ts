// src/presentation/controllers/ScheduleController.ts
import { Request, Response, NextFunction } from 'express';
import { ScheduleService } from '@/application/schedule/services/ScheduleService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { ScheduleResponseDto, ScheduleFiltersDto, PaginationDto } from '@/application/schedule/dto/ScheduleDto';

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
      const id = parseInt(req.params.id);
      const schedule = await this.scheduleService.getScheduleById(id);
      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllSchedules = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ScheduleResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: ScheduleFiltersDto = {
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        seasonYear: req.query.seasonYear ? parseInt(req.query.seasonYear as string) : undefined,
        oppTeamId: req.query.oppTeamId ? parseInt(req.query.oppTeamId as string) : undefined,
        oppTeamConference: req.query.oppTeamConference as string,
        oppTeamDivision: req.query.oppTeamDivision as string,
        scheduleWeek: req.query.scheduleWeek ? parseInt(req.query.scheduleWeek as string) : undefined,
        gameCity: req.query.gameCity as string,
        gameStateProvince: req.query.gameStateProvince as string,
        gameCountry: req.query.gameCountry as string,
        wonLostFlag: req.query.wonLostFlag as string,
        homeOrAway: req.query.homeOrAway as string,
        completed: req.query.completed ? req.query.completed === 'true' : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const schedules = await this.scheduleService.getAllSchedules(filters, pagination);
      res.json({
        success: true,
        data: schedules,
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
      await this.scheduleService.deleteSchedule(id);
      res.status(204).json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamSchedule = async (
    req: Request,
    res: Response<ApiResponse<ScheduleResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonYear = parseInt(req.params.seasonYear);
      const schedules = await this.scheduleService.getTeamSchedule(teamId, seasonYear);
      res.json({
        success: true,
        data: schedules,
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
      const oppTeamId = parseInt(req.params.oppTeamId);
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
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
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
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
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
      const id = parseInt(req.params.id);
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
