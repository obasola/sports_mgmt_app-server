// src/presentation/controllers/PlayoffBracketController.ts
import type { Request, Response } from 'express';
import type { PlayoffBracketService } from '@/application/playoffs/services/PlayoffBracketServiceInterface';

export class PlayoffBracketController {
  constructor(private readonly bracketService: PlayoffBracketService) {}

  async getBracket(req: Request, res: Response): Promise<void> {
    const seasonYear = Number(req.query.seasonYear);
    const mode = (req.query.mode as 'actual' | 'projected') ?? 'actual';

    if (!Number.isInteger(seasonYear)) {
      res.status(400).json({
        error: 'seasonYear must be a valid integer',
      });
      return;
    }

    if (mode !== 'actual' && mode !== 'projected') {
      res.status(400).json({ error: 'mode must be actual or projected' });
      return;
    }

    try {
      const bracket = await this.bracketService.getBracketForSeason(
        seasonYear,
        mode
      );
      res.json(bracket);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}
