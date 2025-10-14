import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { ComputeStandingsService } from '../../application/standings/services/ComputeStandingsService';
import { ListStandingsUseCase } from '../../application/standings/useCases/ListStandingsUseCase';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const seasonType = Number(req.query.seasonType) || 2;
    const useCase = new ListStandingsUseCase(
      new PrismaStandingsRepository(new PrismaClient()),
      new ComputeStandingsService()
    );
    const data = await useCase.execute(year, seasonType);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

