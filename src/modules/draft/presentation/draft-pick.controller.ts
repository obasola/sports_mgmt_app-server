import { Request, Response } from 'express';
import { DraftPickService } from '../application/draft-pick.service';
import {
  CreateDraftPickDto,
  CreateDraftPickSchema,
  UpdateDraftPickDto,
  UpdateDraftPickSchema,
  UseDraftPickDto,
  UseDraftPickSchema,
  TradeDraftPickDto,
  TradeDraftPickSchema,
  OriginalTeamDto,
  OriginalTeamSchema,
  DraftPickFilterDto,
  DraftPickFilterSchema,
  mapDraftPickToDto,
} from '../application/dtos/draft-pick.dto';
import { ZodError } from 'zod';

export class DraftPickController {
  private readonly draftPickService: DraftPickService;

  constructor(draftPickService: DraftPickService) {
    this.draftPickService = draftPickService;
  }

  /**
   * Get a draft pick by id
   */
  async getDraftPickById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid draft pick ID' });
      return;
    }

    const result = await this.draftPickService.getDraftPickById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPick = result.getValue();

    if (!draftPick) {
      res.status(404).json({ error: 'Draft pick not found' });
      return;
    }

    res.status(200).json(mapDraftPickToDto(draftPick));
  }

  /**
   * Get all draft picks with optional pagination
   */
  async getAllDraftPicks(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if ((limit !== undefined && isNaN(limit)) || (offset !== undefined && isNaN(offset))) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const result = await this.draftPickService.getAllDraftPicks(limit, offset);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPicks = result.getValue();
    const draftPickDtos = draftPicks.map(mapDraftPickToDto);

    res.status(200).json(draftPickDtos);
  }

  /**
   * Create a new draft pick
   */
  async createDraftPick(req: Request, res: Response): Promise<void> {
    try {
      const draftPickData: CreateDraftPickDto = CreateDraftPickSchema.parse(req.body);
      const result = await this.draftPickService.createDraftPick(draftPickData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdDraftPick = result.getValue();
      res.status(201).json(mapDraftPickToDto(createdDraftPick));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to create draft pick', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing draft pick
   */
  async updateDraftPick(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid draft pick ID' });
        return;
      }

      const draftPickData: UpdateDraftPickDto = UpdateDraftPickSchema.parse(req.body);
      const result = await this.draftPickService.updateDraftPick(id, draftPickData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedDraftPick = result.getValue();
      res.status(200).json(mapDraftPickToDto(updatedDraftPick));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update draft pick', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a draft pick
   */
  async deleteDraftPick(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid draft pick ID' });
      return;
    }

    const result = await this.draftPickService.deleteDraftPick(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Get draft picks by year
   */
  async getDraftPicksByYear(req: Request, res: Response): Promise<void> {
    const year = parseInt(req.params.year, 10);

    if (isNaN(year)) {
      res.status(400).json({ error: 'Invalid year' });
      return;
    }

    const result = await this.draftPickService.getDraftPicksByYear(year);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPicks = result.getValue();
    const draftPickDtos = draftPicks.map(mapDraftPickToDto);

    res.status(200).json(draftPickDtos);
  }

  /**
   * Get draft picks by team
   */
  async getDraftPicksByTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.draftPickService.getDraftPicksByTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPicks = result.getValue();
    const draftPickDtos = draftPicks.map(mapDraftPickToDto);

    res.status(200).json(draftPickDtos);
  }

  /**
   * Get unused draft picks by team
   */
  async getUnusedDraftPicksByTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.draftPickService.getUnusedDraftPicksByTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPicks = result.getValue();
    const draftPickDtos = draftPicks.map(mapDraftPickToDto);

    res.status(200).json(draftPickDtos);
  }

  /**
   * Get draft pick by prospect
   */
  async getDraftPickByProspect(req: Request, res: Response): Promise<void> {
    const prospectId = parseInt(req.params.prospectId, 10);

    if (isNaN(prospectId)) {
      res.status(400).json({ error: 'Invalid prospect ID' });
      return;
    }

    const result = await this.draftPickService.getDraftPickByProspect(prospectId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPick = result.getValue();

    if (!draftPick) {
      res.status(404).json({ error: 'No draft pick found for this prospect' });
      return;
    }

    res.status(200).json(mapDraftPickToDto(draftPick));
  }

  /**
   * Get draft pick by player
   */
  async getDraftPickByPlayer(req: Request, res: Response): Promise<void> {
    const playerId = parseInt(req.params.playerId, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.draftPickService.getDraftPickByPlayer(playerId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPick = result.getValue();

    if (!draftPick) {
      res.status(404).json({ error: 'No draft pick found for this player' });
      return;
    }

    res.status(200).json(mapDraftPickToDto(draftPick));
  }

  /**
   * Get draft pick by round, pick number, and year
   */
  async getDraftPickByRoundPickYear(req: Request, res: Response): Promise<void> {
    const round = parseInt(req.params.round, 10);
    const pickNumber = parseInt(req.params.pickNumber, 10);
    const draftYear = parseInt(req.params.draftYear, 10);

    if (isNaN(round) || isNaN(pickNumber) || isNaN(draftYear)) {
      res.status(400).json({ error: 'Invalid round, pick number, or draft year' });
      return;
    }

    const result = await this.draftPickService.getDraftPickByRoundPickYear(
      round,
      pickNumber,
      draftYear,
    );

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const draftPick = result.getValue();

    if (!draftPick) {
      res.status(404).json({ error: 'No draft pick found with these parameters' });
      return;
    }

    res.status(200).json(mapDraftPickToDto(draftPick));
  }

  /**
   * Use a draft pick to select a prospect
   */
  async useDraftPickForProspect(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid draft pick ID' });
        return;
      }

      const useData: UseDraftPickDto = UseDraftPickSchema.parse(req.body);
      const result = await this.draftPickService.useDraftPickForProspect(id, useData.prospectId);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedDraftPick = result.getValue();
      res.status(200).json(mapDraftPickToDto(updatedDraftPick));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to use draft pick', details: (error as Error).message });
      }
    }
  }

  /**
   * Trade a draft pick to another team
   */
  async tradeDraftPick(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid draft pick ID' });
        return;
      }

      const tradeData: TradeDraftPickDto = TradeDraftPickSchema.parse(req.body);
      const result = await this.draftPickService.tradeDraftPick(id, tradeData.teamId);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedDraftPick = result.getValue();
      res.status(200).json(mapDraftPickToDto(updatedDraftPick));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to trade draft pick', details: (error as Error).message });
      }
    }
  }

  /**
   * Set original team for a draft pick
   */
  async setOriginalTeam(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid draft pick ID' });
        return;
      }

      const teamData: OriginalTeamDto = OriginalTeamSchema.parse(req.body);
      const result = await this.draftPickService.setOriginalTeam(id, teamData.teamId);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedDraftPick = result.getValue();
      res.status(200).json(mapDraftPickToDto(updatedDraftPick));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to set original team', details: (error as Error).message });
      }
    }
  }

  /**
   * Reset a draft pick
   */
  async resetDraftPick(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid draft pick ID' });
      return;
    }

    const result = await this.draftPickService.resetDraftPick(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    const updatedDraftPick = result.getValue();
    res.status(200).json(mapDraftPickToDto(updatedDraftPick));
  }

  /**
   * Get draft picks by filters
   */
  async getDraftPicksByFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: DraftPickFilterDto = DraftPickFilterSchema.parse(req.query);

      // Parse numeric query parameters
      if (req.query.round && typeof req.query.round === 'string') {
        filters.round = parseInt(req.query.round, 10);
      }

      if (req.query.pickNumber && typeof req.query.pickNumber === 'string') {
        filters.pickNumber = parseInt(req.query.pickNumber, 10);
      }

      if (req.query.draftYear && typeof req.query.draftYear === 'string') {
        filters.draftYear = parseInt(req.query.draftYear, 10);
      }

      if (req.query.currentTeamId && typeof req.query.currentTeamId === 'string') {
        filters.currentTeamId = parseInt(req.query.currentTeamId, 10);
      }

      if (req.query.originalTeam && typeof req.query.originalTeam === 'string') {
        filters.originalTeam = parseInt(req.query.originalTeam, 10);
      }

      if (req.query.used && typeof req.query.used === 'string') {
        filters.used = req.query.used.toLowerCase() === 'true';
      }

      const result = await this.draftPickService.getDraftPicksByFilters(filters);

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const draftPicks = result.getValue();
      const draftPickDtos = draftPicks.map(mapDraftPickToDto);

      res.status(200).json(draftPickDtos);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({
            error: 'Failed to get draft picks by filters',
            details: (error as Error).message,
          });
      }
    }
  }
}
