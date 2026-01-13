// src/presentation/routes/playoffsRoutes.ts
import { Router } from 'express';
import { z } from 'zod';

import { prisma } from "@/infrastructure/database/prisma";

import { PlayoffBracketController } from '../controllers/PlayoffBracketController';
import { validateQuery } from '../middleware/validation';

import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { PlayoffSeedingService } from '@/application/standings/services/PlayoffSeedingService';
import { GeneratePlayoffBracketService } from '@/application/playoffs/services/GeneratePlayoffBracketService';

const router = Router();
console.log('📦 LOADED playoffsRoutes from:', __filename)

const gameRepo = new PrismaGameRepository(prisma);
const standingsRepo = new PrismaStandingsRepository(prisma);
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
