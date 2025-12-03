// src/presentation/controllers/PlayoffBracketController.ts
import type { Request, Response } from 'express';
import type { PlayoffBracketService } from '@/application/playoffs/services/PlayoffBracketService';

export class PlayoffBracketController {
  constructor(private readonly bracketService: PlayoffBracketService) {}

  // GET /api/playoffs/bracket?seasonYear=2025
  async getBracket(req: Request, res: Response): Promise<void> {
    const seasonYearParam = req.query.seasonYear;
    const seasonYear = typeof seasonYearParam === 'string' ? Number(seasonYearParam) : NaN;

    if (!Number.isInteger(seasonYear)) {
      res.status(400).json({ error: 'seasonYear query param is required and must be an integer' });
      return;
    }

    try {
      const bracket = await this.bracketService.getBracketForSeason(seasonYear);
      const dto = bracket; // mapping is trivial for now
      res.json(dto);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  }
}

