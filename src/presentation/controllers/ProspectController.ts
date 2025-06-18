// src/presentation/controllers/ProspectController.ts
import { Request, Response, NextFunction } from 'express';
import { ProspectService } from '@/application/prospect/services/ProspectService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { 
  ProspectResponseDto, 
  ProspectFiltersDto, 
  PaginationDto,
  ProspectStatsDto,
  TopAthletesResponseDto,
} from '@/application/prospect/dto/ProspectDto';

export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  createProspect = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const prospect = await this.prospectService.createProspect(req.body);
      res.status(201).json({
        success: true,
        data: prospect,
        message: 'Prospect created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectById = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.getProspectById(id);
      res.json({
        success: true,
        data: prospect,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllProspects = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: ProspectFiltersDto = {
        firstName: req.query.firstName as string,
        lastName: req.query.lastName as string,
        position: req.query.position as string,
        college: req.query.college as string,
        homeState: req.query.homeState as string,
        drafted: req.query.drafted ? req.query.drafted === 'true' : undefined,
        draftYear: req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined,
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        minHeight: req.query.minHeight ? parseFloat(req.query.minHeight as string) : undefined,
        maxHeight: req.query.maxHeight ? parseFloat(req.query.maxHeight as string) : undefined,
        minWeight: req.query.minWeight ? parseFloat(req.query.minWeight as string) : undefined,
        maxWeight: req.query.maxWeight ? parseFloat(req.query.maxWeight as string) : undefined,
        minFortyTime: req.query.minFortyTime ? parseFloat(req.query.minFortyTime as string) : undefined,
        maxFortyTime: req.query.maxFortyTime ? parseFloat(req.query.maxFortyTime as string) : undefined,
        minVerticalLeap: req.query.minVerticalLeap ? parseFloat(req.query.minVerticalLeap as string) : undefined,
        maxVerticalLeap: req.query.maxVerticalLeap ? parseFloat(req.query.maxVerticalLeap as string) : undefined,
        minBenchPress: req.query.minBenchPress ? parseFloat(req.query.minBenchPress as string) : undefined,
        maxBenchPress: req.query.maxBenchPress ? parseFloat(req.query.maxBenchPress as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getAllProspects(filters, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProspect = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.updateProspect(id, req.body);
      res.json({
        success: true,
        data: prospect,
        message: 'Prospect updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProspect = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.prospectService.deleteProspect(id);
      res.status(204).json({
        success: true,
        message: 'Prospect deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectsByPosition = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const position = req.params.position;
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getProspectsByPosition(position, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectsByCollege = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const college = req.params.college;
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getProspectsByCollege(college, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  getUndraftedProspects = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getUndraftedProspects(pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  getDraftedProspects = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftYear = req.query.draftYear ? parseInt(req.query.draftYear as string) : undefined;
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getDraftedProspects(draftYear, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectsByTeam = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getProspectsByTeam(teamId, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePersonalInfo = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.updatePersonalInfo(id, req.body);
      res.json({
        success: true,
        data: prospect,
        message: 'Personal information updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateCombineScores = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.updateCombineScores(id, req.body);
      res.json({
        success: true,
        data: prospect,
        message: 'Combine scores updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  markAsDrafted = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.markAsDrafted(id, req.body);
      res.json({
        success: true,
        data: prospect,
        message: 'Prospect marked as drafted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  markAsUndrafted = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await this.prospectService.markAsUndrafted(id);
      res.json({
        success: true,
        data: prospect,
        message: 'Prospect marked as undrafted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTopAthletes = async (
    req: Request,
    res: Response<ApiResponse<TopAthletesResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const athletes = await this.prospectService.getTopAthletes(limit);
      res.json({
        success: true,
        data: athletes,
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectsByCombineScore = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<ProspectResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters = {
        minFortyTime: req.query.minFortyTime ? parseFloat(req.query.minFortyTime as string) : undefined,
        maxFortyTime: req.query.maxFortyTime ? parseFloat(req.query.maxFortyTime as string) : undefined,
        minVerticalLeap: req.query.minVerticalLeap ? parseFloat(req.query.minVerticalLeap as string) : undefined,
        maxVerticalLeap: req.query.maxVerticalLeap ? parseFloat(req.query.maxVerticalLeap as string) : undefined,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const prospects = await this.prospectService.getProspectsByCombineScore(filters, pagination);
      res.json({
        success: true,
        data: prospects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProspectStats = async (
    req: Request,
    res: Response<ApiResponse<ProspectStatsDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.prospectService.getProspectStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  findDuplicateProspects = async (
    req: Request,
    res: Response<ApiResponse<ProspectResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const duplicates = await this.prospectService.findDuplicateProspects();
      res.json({
        success: true,
        data: duplicates,
        message: `Found ${duplicates.length} potential duplicate prospects`,
      });
    } catch (error) {
      next(error);
    }
  };
}