import { Request, Response } from 'express';
import { CombineScoreService } from '../application/combine-score.service';
import {
  CreateCombineScoreDto,
  CreateCombineScoreSchema,
  UpdateCombineScoreDto,
  UpdateCombineScoreSchema,
  SpeedMetricsDto,
  SpeedMetricsSchema,
  JumpMetricsDto,
  JumpMetricsSchema,
  PlayerLinkDto,
  PlayerLinkSchema,
  CombineScoreFilterDto,
  CombineScoreFilterSchema,
  mapCombineScoreToDto,
} from '../application/dtos/combine-score.dto';
import { ZodError } from 'zod';

export class CombineScoreController {
  private readonly combineScoreService: CombineScoreService;

  constructor(combineScoreService: CombineScoreService) {
    this.combineScoreService = combineScoreService;
  }

  /**
   * Get a combine score by id
   */
  async getCombineScoreById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid combine score ID' });
      return;
    }

    const result = await this.combineScoreService.getCombineScoreById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const combineScore = result.getValue();

    if (!combineScore) {
      res.status(404).json({ error: 'Combine score not found' });
      return;
    }

    res.status(200).json(mapCombineScoreToDto(combineScore));
  }

  /**
   * Get combine score by player id
   */
  async getCombineScoreByPlayerId(req: Request, res: Response): Promise<void> {
    const playerId = parseInt(req.params.playerId, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.combineScoreService.getCombineScoreByPlayerId(playerId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const combineScore = result.getValue();

    if (!combineScore) {
      res.status(404).json({ error: 'Combine score not found for this player' });
      return;
    }

    res.status(200).json(mapCombineScoreToDto(combineScore));
  }

  /**
   * Get all combine scores with optional pagination
   */
  async getAllCombineScores(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if ((limit !== undefined && isNaN(limit)) || (offset !== undefined && isNaN(offset))) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const result = await this.combineScoreService.getAllCombineScores(limit, offset);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const combineScores = result.getValue();
    const combineScoreDtos = combineScores.map(mapCombineScoreToDto);

    res.status(200).json(combineScoreDtos);
  }

  /**
   * Create a new combine score
   */
  async createCombineScore(req: Request, res: Response): Promise<void> {
    try {
      const combineScoreData: CreateCombineScoreDto = CreateCombineScoreSchema.parse(req.body);
      const result = await this.combineScoreService.createCombineScore(combineScoreData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdCombineScore = result.getValue();
      res.status(201).json(mapCombineScoreToDto(createdCombineScore));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to create combine score', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing combine score
   */
  async updateCombineScore(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid combine score ID' });
        return;
      }

      const combineScoreData: UpdateCombineScoreDto = UpdateCombineScoreSchema.parse(req.body);
      const result = await this.combineScoreService.updateCombineScore(id, combineScoreData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedCombineScore = result.getValue();
      res.status(200).json(mapCombineScoreToDto(updatedCombineScore));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update combine score', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a combine score
   */
  async deleteCombineScore(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid combine score ID' });
      return;
    }

    const result = await this.combineScoreService.deleteCombineScore(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Update speed metrics
   */
  async updateSpeedMetrics(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid combine score ID' });
        return;
      }

      const speedData: SpeedMetricsDto = SpeedMetricsSchema.parse(req.body);
      const result = await this.combineScoreService.updateSpeedMetrics(id, speedData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedCombineScore = result.getValue();
      res.status(200).json(mapCombineScoreToDto(updatedCombineScore));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update speed metrics', details: (error as Error).message });
      }
    }
  }

  /**
   * Update jump metrics
   */
  async updateJumpMetrics(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid combine score ID' });
        return;
      }

      const jumpData: JumpMetricsDto = JumpMetricsSchema.parse(req.body);
      const result = await this.combineScoreService.updateJumpMetrics(id, jumpData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedCombineScore = result.getValue();
      res.status(200).json(mapCombineScoreToDto(updatedCombineScore));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update jump metrics', details: (error as Error).message });
      }
    }
  }

  /**
   * Link combine score to player
   */
  async linkToPlayer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid combine score ID' });
        return;
      }

      const linkData: PlayerLinkDto = PlayerLinkSchema.parse(req.body);
      const result = await this.combineScoreService.linkCombineScoreToPlayer(id, linkData.playerId);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedCombineScore = result.getValue();
      res.status(200).json(mapCombineScoreToDto(updatedCombineScore));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({
            error: 'Failed to link combine score to player',
            details: (error as Error).message,
          });
      }
    }
  }

  /**
   * Get combine scores by filters
   */
  async getCombineScoresByFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: CombineScoreFilterDto = CombineScoreFilterSchema.parse(req.query);

      // Parse numeric query parameters
      if (req.query.fortyTimeLessThan && typeof req.query.fortyTimeLessThan === 'string') {
        filters.fortyTimeLessThan = parseFloat(req.query.fortyTimeLessThan);
      }

      if (
        req.query.verticalLeapGreaterThan &&
        typeof req.query.verticalLeapGreaterThan === 'string'
      ) {
        filters.verticalLeapGreaterThan = parseFloat(req.query.verticalLeapGreaterThan);
      }

      if (req.query.broadJumpGreaterThan && typeof req.query.broadJumpGreaterThan === 'string') {
        filters.broadJumpGreaterThan = parseFloat(req.query.broadJumpGreaterThan);
      }

      const result = await this.combineScoreService.getCombineScoresByFilters(filters);

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const combineScores = result.getValue();
      const combineScoreDtos = combineScores.map(mapCombineScoreToDto);

      res.status(200).json(combineScoreDtos);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({
            error: 'Failed to get combine scores by filters',
            details: (error as Error).message,
          });
      }
    }
  }
}
