// src/presentation/routes/draftpickRoutes.ts
import { Router } from 'express';
import { DraftPickController } from '../controllers/DraftPickController';
import { DraftPickService } from '@/application/draftPick/services/DraftPickService';
import { PrismaDraftPickRepository } from '@/infrastructure/repositories/PrismaDraftPickRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateDraftPickDtoSchema,
  UpdateDraftPickDtoSchema,
  UseDraftPickDtoSchema,
  AssignPlayerDtoSchema,
  TradeDraftPickDtoSchema,
  DraftPickFiltersDtoSchema,
  PaginationDtoSchema,
  BulkCreateDraftPicksDtoSchema,
} from '@/application/draftPick/dto/DraftPickDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const draftPickRepository = new PrismaDraftPickRepository();
const draftPickService = new DraftPickService(draftPickRepository);
const draftPickController = new DraftPickController(draftPickService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

const RoundDraftYearParamsSchema = z.object({
  round: z.string().regex(/^\d+$/, 'Round must be a number').transform(Number),
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number),
});

const DraftYearParamsSchema = z.object({
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number),
});

const QuerySchema = DraftPickFiltersDtoSchema.merge(PaginationDtoSchema);

const TeamQuerySchema = z.object({
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number).optional(),
});

const UnusedUsedQuerySchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number).optional(),
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number).optional(),
});

const TradedQuerySchema = z.object({
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number).optional(),
});

// Main CRUD routes
router.post(
  '/',
  validateBody(CreateDraftPickDtoSchema),
  draftPickController.createDraftPick
);

router.post(
  '/bulk',
  validateBody(BulkCreateDraftPicksDtoSchema),
  draftPickController.bulkCreateDraftPicks
);

router.get(
  '/',
  validateQuery(QuerySchema),
  draftPickController.getAllDraftPicks
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  draftPickController.getDraftPickById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateDraftPickDtoSchema),
  draftPickController.updateDraftPick
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  draftPickController.deleteDraftPick
);

// Draft pick action routes
router.post(
  '/:id/use',
  validateParams(IdParamsSchema),
  validateBody(UseDraftPickDtoSchema),
  draftPickController.useDraftPick
);

router.post(
  '/:id/assign-player',
  validateParams(IdParamsSchema),
  validateBody(AssignPlayerDtoSchema),
  draftPickController.assignPlayerToDraftPick
);

router.post(
  '/:id/trade',
  validateParams(IdParamsSchema),
  validateBody(TradeDraftPickDtoSchema),
  draftPickController.tradeDraftPick
);

router.post(
  '/:id/reset',
  validateParams(IdParamsSchema),
  draftPickController.resetDraftPick
);

// Query routes by team
router.get(
  '/team/:teamId',
  validateParams(TeamIdParamsSchema),
  validateQuery(TeamQuerySchema),
  draftPickController.getDraftPicksByTeam
);

// Query routes by round and year
router.get(
  '/round/:round/year/:draftYear',
  validateParams(RoundDraftYearParamsSchema),
  draftPickController.getDraftPicksByRound
);

// Query routes by year
router.get(
  '/year/:draftYear',
  validateParams(DraftYearParamsSchema),
  draftPickController.getDraftPicksByYear
);

router.get(
  '/year/:draftYear/first-round',
  validateParams(DraftYearParamsSchema),
  draftPickController.getFirstRoundPicks
);

router.get(
  '/year/:draftYear/compensatory',
  validateParams(DraftYearParamsSchema),
  draftPickController.getCompensatoryPicks
);

router.get(
  '/year/:draftYear/summary',
  validateParams(DraftYearParamsSchema),
  draftPickController.getDraftYearSummary
);

router.get(
  '/year/:draftYear/stats',
  validateParams(DraftYearParamsSchema),
  draftPickController.getDraftYearStats
);

// Status-based query routes
router.get(
  '/status/unused',
  validateQuery(UnusedUsedQuerySchema),
  draftPickController.getUnusedDraftPicks
);

router.get(
  '/status/used',
  validateQuery(UnusedUsedQuerySchema),
  draftPickController.getUsedDraftPicks
);

router.get(
  '/status/traded',
  validateQuery(TradedQuerySchema),
  draftPickController.getTradedDraftPicks
);

// Utility routes
router.get(
  '/utils/next-pick/round/:round/year/:draftYear',
  validateParams(RoundDraftYearParamsSchema),
  draftPickController.getNextAvailablePickNumber
);

export { router as draftpickRoutes };