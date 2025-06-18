// src/presentation/routes/teamNeedRoutes.ts
import { Router } from 'express';
import { TeamNeedController } from '../controllers/TeamNeedController';
import { TeamNeedService } from '@/application/teamNeed/services/TeamNeedService';
import { PrismaTeamNeedRepository } from '@/infrastructure/repositories/PrismaTeamNeedRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateTeamNeedDtoSchema,
  UpdateTeamNeedDtoSchema,
  TeamNeedFiltersDtoSchema,
  PaginationDtoSchema,
} from '@/application/teamNeed/dto/TeamNeedDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const teamNeedRepository = new PrismaTeamNeedRepository();
const teamNeedService = new TeamNeedService(teamNeedRepository);
const teamNeedController = new TeamNeedController(teamNeedService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

const PositionParamsSchema = z.object({
  position: z.string().min(1, 'Position is required').max(10, 'Position cannot exceed 10 characters'),
});

const DraftYearParamsSchema = z.object({
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number),
});

const QuerySchema = TeamNeedFiltersDtoSchema.merge(PaginationDtoSchema);

const UpdatePrioritySchema = z.object({
  priority: z.number().min(1, 'Priority must be at least 1').max(10, 'Priority cannot exceed 10'),
});

// CRUD Routes
router.post(
  '/',
  validateBody(CreateTeamNeedDtoSchema),
  teamNeedController.createTeamNeed
);

router.get(
  '/',
  validateQuery(QuerySchema),
  teamNeedController.getAllTeamNeeds
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  teamNeedController.getTeamNeedById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateTeamNeedDtoSchema),
  teamNeedController.updateTeamNeed
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  teamNeedController.deleteTeamNeed
);

// Domain-specific routes

// Get all needs for a specific team
router.get(
  '/team/:teamId',
  validateParams(TeamIdParamsSchema),
  teamNeedController.getTeamNeeds
);

// Get high priority needs (optionally filtered by team)
router.get(
  '/high-priority',
  validateQuery(z.object({ teamId: z.number().positive().optional() })),
  teamNeedController.getHighPriorityNeeds
);

// Get needs by position
router.get(
  '/position/:position',
  validateParams(PositionParamsSchema),
  teamNeedController.getNeedsByPosition
);

// Get needs by draft year
router.get(
  '/draft-year/:draftYear',
  validateParams(DraftYearParamsSchema),
  teamNeedController.getNeedsByDraftYear
);

// Update team need priority (specialized endpoint)
router.patch(
  '/:id/priority',
  validateParams(IdParamsSchema),
  validateBody(UpdatePrioritySchema),
  teamNeedController.updateTeamNeedPriority
);

export { router as teamNeedRoutes };