import { Request, Response } from 'express';
import { StandingsService } from '@/application/standings/services/StandingsService';

export class StandingsController {
  constructor(private service: StandingsService) {}

  async get(req: Request, res: Response) {
    const { year, seasonType } = req.query;
    const data = await this.service.getStandings(Number(year), Number(seasonType ?? 2));
    res.json({ data });
  }
}
