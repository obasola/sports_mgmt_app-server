// src/presentation/routes/playoffsRoutes.ts
import { Router } from 'express';
import { z } from 'zod';

import { prisma as prismaClient } from '../../infrastructure/prisma';

import { PlayoffBracketController } from '../controllers/PlayoffBracketController';
import { validateQuery } from '../middleware/validation';

import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { PlayoffSeedingService } from '@/application/playoffs/services/PlayoffSeedingService';
import { GeneratePlayoffBracketService } from '@/application/playoffs/services/GeneratePlayoffBracketService';

const router = Router();

const gameRepo = new PrismaGameRepository(prismaClient);
const standingsRepo = new PrismaStandingsRepository(prismaClient);
const seeding = new PlayoffSeedingService();

const service = new GeneratePlayoffBracketService(gameRepo, standingsRepo, seeding);

const controller = new PlayoffBracketController(service);

const QuerySchema = z
  .object({
    seasonYear: z.string().regex(/^\d{4}$/),
    mode: z.enum(['actual', 'projected']).optional(),
  })
  .passthrough();

router.get('/bracket', validateQuery(QuerySchema), (req, res) =>
  controller.getBracket(req, res)
);

export { router as playoffsRoutes };
