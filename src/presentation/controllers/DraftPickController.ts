// src/presentation/controllers/DraftPickController.ts
import { Request, Response, NextFunction } from 'express';
import { DraftPickService } from '@/application/draftPick/services/DraftPickService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { 
  DraftPickResponseDto, 
  DraftPickFiltersDto, 
  PaginationDto,
  DraftPickSummaryDto,
  DraftYearStatsDto
} from '@/application/draftPick/dto/DraftPickDto';

export class DraftPickController {
  constructor(private readonly draftPickService: DraftPickService) {}

  createDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftPick = await this.draftPickService.createDraftPick(req.body);
      res.status(201).json({
        success: true,
        data: draftPick,
        message: 'Draft pick created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  bulkCreateDraftPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftPicks = await this.draftPickService.bulkCreateDraftPicks(req.body);
      res.status(201).json({
        success: true,
        data: draftPicks,
        message: `${draftPicks.length} draft picks created successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftPickById = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.getDraftPickById(id);
      res.json({
        success: true,
        data: draftPick,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllDraftPicks = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<DraftPickResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: DraftPickFiltersDto = {
        round: req.query.round ? parseInt(req.query.round as string) : undefined,
        draftYear: req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined,
        currentTeamId: req.query.currentTeamId ? parseInt(req.query.currentTeamId as string) : undefined,
        originalTeam: req.query.originalTeam ? parseInt(req.query.originalTeam as string) : undefined,
        used: req.query.used ? req.query.used === 'true' : undefined,
        prospectId: req.query.prospectId ? parseInt(req.query.prospectId as string) : undefined,
        playerId: req.query.playerId ? parseInt(req.query.playerId as string) : undefined,
        minPickNumber: req.query.minPickNumber ? parseInt(req.query.minPickNumber as string) : undefined,
        maxPickNumber: req.query.maxPickNumber ? parseInt(req.query.maxPickNumber as string) : undefined,
        isFirstRound: req.query.isFirstRound ? req.query.isFirstRound === 'true' : undefined,
        hasProspect: req.query.hasProspect ? req.query.hasProspect === 'true' : undefined,
        hasPlayer: req.query.hasPlayer ? req.query.hasPlayer === 'true' : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const draftPicks = await this.draftPickService.getAllDraftPicks(filters, pagination);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.updateDraftPick(id, req.body);
      res.json({
        success: true,
        data: draftPick,
        message: 'Draft pick updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteDraftPick = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.draftPickService.deleteDraftPick(id);
      res.status(204).json({
        success: true,
        message: 'Draft pick deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  useDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.useDraftPick(id, req.body);
      res.json({
        success: true,
        data: draftPick,
        message: 'Draft pick used successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  assignPlayerToDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.assignPlayerToDraftPick(id, req.body);
      res.json({
        success: true,
        data: draftPick,
        message: 'Player assigned to draft pick successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  tradeDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.tradeDraftPick(id, req.body);
      res.json({
        success: true,
        data: draftPick,
        message: 'Draft pick traded successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  resetDraftPick = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const draftPick = await this.draftPickService.resetDraftPick(id);
      res.json({
        success: true,
        data: draftPick,
        message: 'Draft pick reset successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftPicksByTeam = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const draftYear = req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined;
      const draftPicks = await this.draftPickService.getDraftPicksByTeam(teamId, draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftPicksByRound = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const round = parseInt(req.params.round);
      const draftYear = parseInt(req.params.draftYear);
      const draftPicks = await this.draftPickService.getDraftPicksByRound(round, draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftPicksByYear = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const draftPicks = await this.draftPickService.getDraftPicksByYear(draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnusedDraftPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const draftYear = req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined;
      const draftPicks = await this.draftPickService.getUnusedDraftPicks(teamId, draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getUsedDraftPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const draftYear = req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined;
      const draftPicks = await this.draftPickService.getUsedDraftPicks(teamId, draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getTradedDraftPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined;
      const draftPicks = await this.draftPickService.getTradedDraftPicks(draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getFirstRoundPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const draftPicks = await this.draftPickService.getFirstRoundPicks(draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompensatoryPicks = async (
    req: Request,
    res: Response<ApiResponse<DraftPickResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const draftPicks = await this.draftPickService.getCompensatoryPicks(draftYear);
      res.json({
        success: true,
        data: draftPicks,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftYearSummary = async (
    req: Request,
    res: Response<ApiResponse<DraftPickSummaryDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const summary = await this.draftPickService.getDraftYearSummary(draftYear);
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftYearStats = async (
    req: Request,
    res: Response<ApiResponse<DraftYearStatsDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.draftYear);
      const stats = await this.draftPickService.getDraftYearStats(draftYear);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getNextAvailablePickNumber = async (
    req: Request,
    res: Response<ApiResponse<{ nextPickNumber: number }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const round = parseInt(req.params.round);
      const draftYear = parseInt(req.params.draftYear);
      const nextPickNumber = await this.draftPickService.getNextAvailablePickNumber(round, draftYear);
      res.json({
        success: true,
        data: { nextPickNumber },
      });
    } catch (error) {
      next(error);
    }
  };
}