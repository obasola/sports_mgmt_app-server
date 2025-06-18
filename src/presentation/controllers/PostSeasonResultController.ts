// src/presentation/controllers/PostSeasonResultController.ts
import { Request, Response, NextFunction } from 'express';
import { PostSeasonResultService } from '@/application/postSeasonResult/services/PostSeasonResultService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { 
  PostSeasonResultResponseDto, 
  PostSeasonResultFiltersDto, 
  PaginationDto,
  TeamPlayoffHistoryQuery,
  PlayoffYearQuery 
} from '@/application/postSeasonResult/dto/PostSeasonResultDto';

export class PostSeasonResultController {
  constructor(private readonly postSeasonResultService: PostSeasonResultService) {}

  createPostSeasonResult = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const postSeasonResult = await this.postSeasonResultService.createPostSeasonResult(req.body);
      res.status(201).json({
        success: true,
        data: postSeasonResult,
        message: 'PostSeason result created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPostSeasonResultById = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const postSeasonResult = await this.postSeasonResultService.getPostSeasonResultById(id);
      res.json({
        success: true,
        data: postSeasonResult,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPostSeasonResults = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<PostSeasonResultResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: PostSeasonResultFiltersDto = {
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        playoffYear: req.query.playoffYear ? parseInt(req.query.playoffYear as string) : undefined,
        lastRoundReached: req.query.lastRoundReached as string,
        winLose: req.query.winLose as string,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const postSeasonResults = await this.postSeasonResultService.getAllPostSeasonResults(filters, pagination);
      res.json({
        success: true,
        data: postSeasonResults,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePostSeasonResult = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const postSeasonResult = await this.postSeasonResultService.updatePostSeasonResult(id, req.body);
      res.json({
        success: true,
        data: postSeasonResult,
        message: 'PostSeason result updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePostSeasonResult = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.postSeasonResultService.deletePostSeasonResult(id);
      res.status(204).json({
        success: true,
        message: 'PostSeason result deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Domain-specific endpoints
  getTeamPlayoffHistory = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: TeamPlayoffHistoryQuery = {
        teamId: parseInt(req.params.teamId),
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };

      const history = await this.postSeasonResultService.getTeamPlayoffHistory(query);
      res.json({
        success: true,
        data: history,
        message: `Playoff history for team ${query.teamId}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getPlayoffResultsByYear = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: PlayoffYearQuery = {
        year: parseInt(req.params.year),
      };

      const results = await this.postSeasonResultService.getPlayoffResultsByYear(query);
      res.json({
        success: true,
        data: results,
        message: `Playoff results for ${query.year}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamWins = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const wins = await this.postSeasonResultService.getTeamWins(teamId);
      res.json({
        success: true,
        data: wins,
        message: `Playoff wins for team ${teamId}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamLosses = async (
    req: Request,
    res: Response<ApiResponse<PostSeasonResultResponseDto[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const losses = await this.postSeasonResultService.getTeamLosses(teamId);
      res.json({
        success: true,
        data: losses,
        message: `Playoff losses for team ${teamId}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamPlayoffStats = async (
    req: Request,
    res: Response<ApiResponse<{
      totalGames: number;
      wins: number;
      losses: number;
      winPercentage: number;
      averageScoreDifferential: number;
    }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teamId = parseInt(req.params.teamId);
      const stats = await this.postSeasonResultService.getTeamPlayoffStats(teamId);
      res.json({
        success: true,
        data: stats,
        message: `Playoff statistics for team ${teamId}`,
      });
    } catch (error) {
      next(error);
    }
  };
}