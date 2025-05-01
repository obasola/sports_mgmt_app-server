import { Request, Response } from 'express';
import { ProspectService } from '../application/prospect.service';
import {
  CreateProspectDto,
  CreateProspectSchema,
  UpdateProspectDto,
  UpdateProspectSchema,
  DraftProspectDto,
  DraftProspectSchema,
  CombineResultsDto,
  CombineResultsSchema,
  ProspectFilterDto,
  ProspectFilterSchema,
  mapProspectToDto,
} from '../application/dtos/prospect.dto';
import { ZodError } from 'zod';

export class ProspectController {
  private readonly prospectService: ProspectService;

  constructor(prospectService: ProspectService) {
    this.prospectService = prospectService;
  }

  /**
   * Get a prospect by id
   */
  async getProspectById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid prospect ID' });
      return;
    }

    const result = await this.prospectService.getProspectById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospect = result.getValue();

    if (!prospect) {
      res.status(404).json({ error: 'Prospect not found' });
      return;
    }

    res.status(200).json(mapProspectToDto(prospect));
  }

  /**
   * Get all prospects with optional pagination
   */
  async getAllProspects(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if ((limit !== undefined && isNaN(limit)) || (offset !== undefined && isNaN(offset))) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const result = await this.prospectService.getAllProspects(limit, offset);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Create a new prospect
   */
  async createProspect(req: Request, res: Response): Promise<void> {
    try {
      const prospectData: CreateProspectDto = CreateProspectSchema.parse(req.body);
      const result = await this.prospectService.createProspect(prospectData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdProspect = result.getValue();
      res.status(201).json(mapProspectToDto(createdProspect));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to create prospect', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing prospect
   */
  async updateProspect(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prospect ID' });
        return;
      }

      const prospectData: UpdateProspectDto = UpdateProspectSchema.parse(req.body);
      const result = await this.prospectService.updateProspect(id, prospectData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedProspect = result.getValue();
      res.status(200).json(mapProspectToDto(updatedProspect));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update prospect', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a prospect
   */
  async deleteProspect(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid prospect ID' });
      return;
    }

    const result = await this.prospectService.deleteProspect(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Draft a prospect
   */
  async draftProspect(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prospect ID' });
        return;
      }

      const draftData: DraftProspectDto = DraftProspectSchema.parse(req.body);
      const result = await this.prospectService.draftProspect(
        id,
        draftData.draftYear,
        draftData.teamId,
        draftData.draftPickId,
      );

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const draftedProspect = result.getValue();
      res.status(200).json(mapProspectToDto(draftedProspect));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to draft prospect', details: (error as Error).message });
      }
    }
  }

  /**
   * Update prospect combine results
   */
  async updateCombineResults(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prospect ID' });
        return;
      }

      const combineData: CombineResultsDto = CombineResultsSchema.parse(req.body);
      const result = await this.prospectService.updateProspectCombineResults(id, combineData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedProspect = result.getValue();
      res.status(200).json(mapProspectToDto(updatedProspect));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update combine results', details: (error as Error).message });
      }
    }
  }

  /**
   * Get prospects by position
   */
  async getProspectsByPosition(req: Request, res: Response): Promise<void> {
    const position = req.params.position;

    if (!position) {
      res.status(400).json({ error: 'Position is required' });
      return;
    }

    const result = await this.prospectService.getProspectsByPosition(position);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get prospects by college
   */
  async getProspectsByCollege(req: Request, res: Response): Promise<void> {
    const college = req.params.college;

    if (!college) {
      res.status(400).json({ error: 'College is required' });
      return;
    }

    const result = await this.prospectService.getProspectsByCollege(college);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get prospects by team
   */
  async getProspectsByTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.prospectService.getProspectsByTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get prospects by draft year
   */
  async getProspectsByDraftYear(req: Request, res: Response): Promise<void> {
    const draftYear = parseInt(req.params.draftYear, 10);

    if (isNaN(draftYear)) {
      res.status(400).json({ error: 'Invalid draft year' });
      return;
    }

    const result = await this.prospectService.getProspectsByDraftYear(draftYear);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get undrafted prospects
   */
  async getUndraftedProspects(req: Request, res: Response): Promise<void> {
    const result = await this.prospectService.getUndraftedProspects();

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get prospect by draft pick
   */
  async getProspectByDraftPick(req: Request, res: Response): Promise<void> {
    const draftPickId = parseInt(req.params.draftPickId, 10);

    if (isNaN(draftPickId)) {
      res.status(400).json({ error: 'Invalid draft pick ID' });
      return;
    }

    const result = await this.prospectService.getProspectByDraftPick(draftPickId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospect = result.getValue();

    if (!prospect) {
      res.status(404).json({ error: 'No prospect found for this draft pick' });
      return;
    }

    res.status(200).json(mapProspectToDto(prospect));
  }

  /**
   * Search prospects by name
   */
  async searchProspectsByName(req: Request, res: Response): Promise<void> {
    const name = req.query.name as string;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Name search term is required' });
      return;
    }

    const result = await this.prospectService.searchProspectsByName(name);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const prospects = result.getValue();
    const prospectDtos = prospects.map(mapProspectToDto);

    res.status(200).json(prospectDtos);
  }

  /**
   * Get prospects by filters
   */
  async getProspectsByFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: ProspectFilterDto = ProspectFilterSchema.parse(req.query);

      // Parse numeric query parameters
      if (req.query.draftYear && typeof req.query.draftYear === 'string') {
        filters.draftYear = parseInt(req.query.draftYear, 10);
      }

      if (req.query.teamId && typeof req.query.teamId === 'string') {
        filters.teamId = parseInt(req.query.teamId, 10);
      }

      if (req.query.drafted && typeof req.query.drafted === 'string') {
        filters.drafted = req.query.drafted.toLowerCase() === 'true';
      }

      const result = await this.prospectService.getProspectsByFilters(filters);

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const prospects = result.getValue();
      const prospectDtos = prospects.map(mapProspectToDto);

      res.status(200).json(prospectDtos);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to get prospects by filters', details: (error as Error).message });
      }
    }
  }
}
