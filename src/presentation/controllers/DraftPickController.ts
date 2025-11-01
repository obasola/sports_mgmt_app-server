import { Request, Response, NextFunction } from 'express';
import type { DraftPickService } from '../../application/draftPick/services/DraftPickService';
import type {
  CreateDraftPickDto,
  UpdateDraftPickDto,
} from '../../application/draftPick/dto/DraftPickDto';

export class DraftPickController {
  constructor(private readonly draftPickService: DraftPickService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateDraftPickDto = req.body;
      const draftPick = await this.draftPickService.create(dto);
      res.status(201).json(draftPick);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID parameter' });
        return;
      }

      const draftPick = await this.draftPickService.findById(id);
      if (!draftPick) {
        res.status(404).json({ error: 'Draft pick not found' });
        return;
      }

      res.status(200).json(draftPick);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: any = {};

      if (req.query.draftYear) {
        filters.draftYear = parseInt(req.query.draftYear as string, 10);
      }
      if (req.query.currentTeamId) {
        filters.currentTeamId = parseInt(req.query.currentTeamId as string, 10);
      }
      if (req.query.used !== undefined) {
        filters.used = req.query.used === 'true';
      }
      if (req.query.round) {
        filters.round = parseInt(req.query.round as string, 10);
      }

      const draftPicks = await this.draftPickService.findAll(filters);
      res.status(200).json(draftPicks);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID parameter' });
        return;
      }

      const dto: UpdateDraftPickDto = req.body;
      const draftPick = await this.draftPickService.update(id, dto);
      res.status(200).json(draftPick);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID parameter' });
        return;
      }

      await this.draftPickService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  fetchAllWithRelations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const draftPicks = await this.draftPickService.fetchAllWithRelations();
      res.status(200).json(draftPicks);
    } catch (error) {
      next(error);
    }
  };

  fetchByYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const draftYear = parseInt(req.params.year, 10);
      if (isNaN(draftYear)) {
        res.status(400).json({ error: 'Invalid year parameter' });
        return;
      }

      const draftPicks = await this.draftPickService.fetchByYear(draftYear);
      res.status(200).json(draftPicks);
    } catch (error) {
      next(error);
    }
  };

  fetchByTeamAndYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('🎯 fetchByTeamAndYear called!');
    console.log('📥 Params:', req.params);
    console.log('📥 teamId:', req.params.teamId, 'year:', req.params.year);
    try {
      const currentTeamId = parseInt(req.params.teamId, 10);
      const draftYear = parseInt(req.params.year, 10);

      if (isNaN(currentTeamId) || isNaN(draftYear)) {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

      const draftPicks = await this.draftPickService.fetchByTeamAndYear(currentTeamId, draftYear);
      res.status(200).json(draftPicks);
    } catch (error) {
      next(error);
    }
  };
}
