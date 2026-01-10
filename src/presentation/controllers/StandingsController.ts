// src/presentation/controllers/StandingsController.ts
import { Request, Response } from 'express';
import { StandingsService } from '@/application/standings/services/StandingsService';
import { PrismaClient } from '@prisma/client';
const debugPrisma = new PrismaClient();

export class StandingsController {
  constructor(private service: StandingsService) {}

  async get(req: Request, res: Response) {
    console.log('[StandingsController::get] >>> standings params', req.query);

    const { year, seasonType } = req.query;
    const data = await this.service.getStandings(Number(year), Number(seasonType ?? 2));
    res.json({ data });
  }

  async debug(req: Request, res: Response) {
    try {
      // Raw results come back as unknown[] in TS, so cast to any[]
      const dbRows = await debugPrisma.$queryRaw<any[]>`SELECT DATABASE() AS db`;
      const countRows = await debugPrisma.$queryRaw<any[]>`SELECT COUNT(*) AS count FROM Game`;

      // Extract values, converting BigInt → Number
      const dbName = dbRows[0]?.db ?? null;
      const countValue = countRows[0]?.count;
      const count = typeof countValue === 'bigint' ? Number(countValue) : countValue;

      res.json({ db: dbName, count });
    } catch (err: any) {
      console.error('[standings debug]', err);
      res.status(500).json({ error: String(err) });
    }
  }
}

