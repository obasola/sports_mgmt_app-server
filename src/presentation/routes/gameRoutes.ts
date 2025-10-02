// src/presentation/routes/gameRoutes.ts
import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

import { GameController } from '../controllers/GameController';
import { GameService } from '@/application/game/services/GameService';
import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { PrismaTeamRepository } from '@/infrastructure/repositories/PrismaTeamRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateGameDtoSchema,
  UpdateGameDtoSchema,
  UpdateScoreDtoSchema,
} from '@/application/game/dto/GameDto';

const router = Router();

/* -----------------------------------------------------------------------------
 * Dependencies - Updated to inject both repositories
 * -------------------------------------------------------------------------- */
const prismaClient = new PrismaClient();
const gameRepository = new PrismaGameRepository(prismaClient);
const teamRepository = new PrismaTeamRepository();
const gameService = new GameService(gameRepository, teamRepository);
const gameController = new GameController(gameService);

/* -----------------------------------------------------------------------------
 * Zod schemas (HTTP edge: params + query only)
 * -------------------------------------------------------------------------- */

// Path param: /:id
const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Path params: /team/:teamId/season/:seasonYear
const TeamSeasonParamsSchema = z.object({
  teamId: z.coerce.number().int().positive(),
  seasonYear: z.string().regex(/^\d{4}$/, 'Season year must be a 4-digit year'),
});

// Query for list endpoints
const GameQuerySchema = z
  .object({
    teamId: z.coerce.number().int().positive().optional(),
    homeTeamId: z.coerce.number().int().positive().optional(),
    awayTeamId: z.coerce.number().int().positive().optional(),
    gameWeek: z.coerce.number().int().min(0).max(25).optional(),
    seasonYear: z.string().regex(/^\d{4}$/, 'seasonYear must be a 4-digit year').optional(),
    seasonType: z.coerce.number().int().min(1).max(3).optional(),
    gameStatus: z.string().optional(),
    gameCity: z.string().optional(),
    gameCountry: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
  })
  .passthrough();

/* -----------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------- */

// Create
router.post('/', validateBody(CreateGameDtoSchema), gameController.createGame);

// List (uses coerced query schema)
router.get('/', validateQuery(GameQuerySchema), gameController.getAllGames);

// Convenience feeds
router.get('/upcoming', gameController.getUpcomingGames);
router.get('/completed', gameController.getCompletedGames);

// ✅ NEW: Team statistics endpoint (add before the /:id route to avoid conflicts)
router.get(
  '/team/:teamId/statistics',
  validateParams(z.object({ teamId: z.coerce.number().int().positive() })),
  validateQuery(z.object({ seasonYear: z.string().regex(/^\d{4}$/).optional() }).passthrough()),
  gameController.getTeamStatistics
);

// Team/season listing
router.get(
  '/team/:teamId/season/:seasonYear',
  validateParams(TeamSeasonParamsSchema),
  validateQuery(
    z
      .object({
        seasonType: z.coerce.number().int().min(1).max(3).optional(),
        week: z.coerce.number().int().min(0).max(25).optional(),
      })
      .passthrough()
  ),
  gameController.getTeamGames
);

// Read one
router.get('/:id', validateParams(IdParamsSchema), gameController.getGameById);

// Preseason / Regular-season convenience endpoints
router.get('/preseason', gameController.getPreseasonGames);
router.get('/regular-season', gameController.getRegularSeasonGames);

// Update
router.put('/:id', validateParams(IdParamsSchema), validateBody(UpdateGameDtoSchema), gameController.updateGame);

// Patch score
router.patch(
  '/:id/score',
  validateParams(IdParamsSchema),
  validateBody(UpdateScoreDtoSchema),
  gameController.updateGameScore
);

// Delete
router.delete('/:id', validateParams(IdParamsSchema), gameController.deleteGame);

export { router as gameRoutes };