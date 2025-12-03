// src/presentation/routes/playoffsRoutes.ts
import { Router } from 'express';
import { z } from 'zod';

import { prisma as prismaClient } from '../../infrastructure/prisma';

import { PlayoffBracketController } from '../controllers/PlayoffBracketController';
import { validateQuery } from '../middleware/validation';

import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { GeneratePlayoffBracketService } from '@/application/playoffs/services/GeneratePlayoffBracketService';
import { PlayoffSeedingService } from '@/application/playoffs/services/PlayoffSeedingService';

const router = Router();

/* -----------------------------------------------------------------------------
 * Dependencies
 * -------------------------------------------------------------------------- */

const gameRepository = new PrismaGameRepository(prismaClient);
const standingsRepository = new PrismaStandingsRepository(prismaClient);
const seedingService = new PlayoffSeedingService();

const playoffBracketService = new GeneratePlayoffBracketService(
  gameRepository,
  standingsRepository,
  seedingService
);

const playoffBracketController = new PlayoffBracketController(playoffBracketService);

/* -----------------------------------------------------------------------------
 * Zod schemas (HTTP edge: query only)
 * -------------------------------------------------------------------------- */

const PlayoffBracketQuerySchema = z
  .object({
    seasonYear: z
      .string()
      .regex(/^\d{4}$/, 'seasonYear must be a 4-digit year'),
  })
  .passthrough();

/* -----------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------- */

// GET /api/playoffs/bracket?seasonYear=2025
router.get(
  '/bracket',
  validateQuery(PlayoffBracketQuerySchema),
  (req, res) => playoffBracketController.getBracket(req, res)
);

export { router as playoffsRoutes };
