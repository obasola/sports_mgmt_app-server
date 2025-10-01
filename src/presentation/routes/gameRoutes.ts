// src/presentation/routes/gameRoutes.ts
// src/presentation/routes/gameRoutes.ts
import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

import { GameController } from '../controllers/GameController';
import { GameService } from '@/application/game/services/GameService';
import { PrismaGameRepository } from '@/infrastructure/repositories/PrismaGameRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateGameDtoSchema,
  UpdateGameDtoSchema,
  UpdateScoreDtoSchema,
} from '@/application/game/dto/GameDto';

const router = Router();

/* -----------------------------------------------------------------------------
 * Dependencies
 * -------------------------------------------------------------------------- */
const gameRepository = new PrismaGameRepository(new PrismaClient());
const gameService = new GameService(gameRepository);
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

// Query for list endpoints. Coerce numbers/dates coming from the URL,
// and allow optional seasonType (1=pre, 2=regular, 3=post).
const GameQuerySchema = z
  .object({
    teamId: z.coerce.number().int().positive().optional(),
    homeTeamId: z.coerce.number().int().positive().optional(),
    awayTeamId: z.coerce.number().int().positive().optional(),
    gameWeek: z.coerce.number().int().min(0).max(25).optional(),

    // keep seasonYear as a 4-digit string if your repo expects string keys
    seasonYear: z.string().regex(/^\d{4}$/, 'seasonYear must be a 4-digit year').optional(),

    // optional; many list pages won’t pass it—controllers can decide defaults
    seasonType: z.coerce.number().int().min(1).max(3).optional(),

    gameStatus: z.string().optional(),
    gameCity: z.string().optional(),
    gameCountry: z.string().optional(),

    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),

    // pagination
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
  })
  .passthrough()

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

// Team/season listing (params coerced; add a small query validator if you want week/seasonType here too)
router.get(
  '/team/:teamId/season/:seasonYear',
  validateParams(TeamSeasonParamsSchema),
  // optionally allow query like ?seasonType=2&week=5
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
