import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { ComputeStandingsService } from '../../application/standings/services/ComputeStandingsService';
import { ListStandingsUseCase } from '../../application/standings/useCases/ListStandingsUseCase';

import { StandingsService } from '@/application/standings/services/StandingsService';
import { StandingsController } from '@/presentation/controllers/StandingsController';
import { PrismaTeamRepository } from '@/infrastructure/repositories/PrismaTeamRepository';
import { TeamService } from '@/application/team/services/TeamService';
import { EspnClient } from '@/infrastructure/espn/EspnClient';
import { PlayoffSeedingService } from '@/application/standings/services/PlayoffSeedingService';

const prisma = new PrismaClient();
const repo = new PrismaStandingsRepository(prisma);
const service = new StandingsService(repo);
const controller = new StandingsController(service);

const teamRepo = new PrismaTeamRepository()


const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const seasonType = Number(req.query.seasonType) || 2;
    const useCase = new ListStandingsUseCase(
      new PrismaStandingsRepository(new PrismaClient()),
      new ComputeStandingsService(),
      new PlayoffSeedingService(),
    );
    const data = await useCase.execute(year, seasonType);
    console.log('[standings] controller HIT', { year: req.query.year, seasonType: req.query.seasonType })

    res.json({ data });
  } catch (err) {
    next(err);
  }
});
router.get('/debug', controller.debug.bind(controller));

export default router;

