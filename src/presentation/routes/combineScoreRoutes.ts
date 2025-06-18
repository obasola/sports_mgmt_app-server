// src/presentation/routes/combineScoreRoutes.ts
import { Router } from 'express';
import { CombineScoreController } from '../controllers/CombineScoreController';
import { CombineScoreService } from '@/application/combineScore/services/CombineScoreService';
import { PrismaCombineScoreRepository } from '@/infrastructure/repositories/PrismaCombineScoreRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateCombineScoreDtoSchema,
  UpdateCombineScoreDtoSchema,
  CombineScoreFiltersDtoSchema,
  PaginationDtoSchema,
  TopPerformersDtoSchema,
  AthleticScoreRangeDtoSchema,
} from '@/application/combineScore/dto/CombineScoreDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const combineScoreRepository = new PrismaCombineScoreRepository();
const combineScoreService = new CombineScoreService(combineScoreRepository);
const combineScoreController = new CombineScoreController(combineScoreService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const PlayerIdParamsSchema = z.object({
  playerId: z.string().regex(/^\d+$/, 'Player ID must be a number').transform(Number),
});

const MetricParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  metric: z.enum(['fortyTime', 'tenYardSplit', 'twentyYardShuttle', 'threeCone', 'verticalLeap', 'broadJump']),
});

const QuerySchema = CombineScoreFiltersDtoSchema.merge(PaginationDtoSchema);
const TopPerformersQuerySchema = TopPerformersDtoSchema;
const AthleticScoreQuerySchema = AthleticScoreRangeDtoSchema;

const PlayerIdsBodySchema = z.object({
  playerIds: z.array(z.number().positive()).min(1, 'At least one player ID is required'),
});

const MetricValueBodySchema = z.object({
  value: z.number().positive('Value must be positive'),
});

// Routes

// Standard CRUD operations
router.post(
  '/',
  validateBody(CreateCombineScoreDtoSchema),
  combineScoreController.createCombineScore
);

router.get(
  '/',
  validateQuery(QuerySchema),
  combineScoreController.getAllCombineScores
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  combineScoreController.getCombineScoreById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateCombineScoreDtoSchema),
  combineScoreController.updateCombineScore
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  combineScoreController.deleteCombineScore
);

// Specialized query routes

// Get combine score by player ID
router.get(
  '/player/:playerId',
  validateParams(PlayerIdParamsSchema),
  combineScoreController.getCombineScoreByPlayerId
);

// Get combine scores for multiple players
router.post(
  '/players/batch',
  validateBody(PlayerIdsBodySchema),
  combineScoreController.getCombineScoresByPlayerIds
);

// Get top performers for a specific metric
router.get(
  '/top-performers',
  validateQuery(TopPerformersQuerySchema),
  combineScoreController.getTopPerformers
);

// Get combine scores by athletic score range
router.get(
  '/athletic-score-range',
  validateQuery(AthleticScoreQuerySchema),
  combineScoreController.getCombineScoresByAthleticScore
);

// Get overall athletic rankings
router.get(
  '/rankings/athletic',
  combineScoreController.getAthleticRankings
);

// Update specific metric
router.patch(
  '/:id/metrics/:metric',
  validateParams(MetricParamsSchema),
  validateBody(MetricValueBodySchema),
  combineScoreController.updateSpecificMetric
);

export { router as combineScoreRoutes };