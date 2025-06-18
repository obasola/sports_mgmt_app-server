// src/presentation/routes/scheduleRoutes.ts
import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';
import { ScheduleService } from '@/application/schedule/services/ScheduleService';
import { PrismaScheduleRepository } from '@/infrastructure/repositories/PrismaScheduleRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateScheduleDtoSchema,
  UpdateScheduleDtoSchema,
  ScheduleFiltersDtoSchema,
  PaginationDtoSchema,
} from '@/application/schedule/dto/ScheduleDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const scheduleRepository = new PrismaScheduleRepository();
const scheduleService = new ScheduleService(scheduleRepository);
const scheduleController = new ScheduleController(scheduleService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const TeamSeasonParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
  seasonYear: z.string().regex(/^\d+$/, 'Season year must be a number').transform(Number),
});

const OpponentParamsSchema = z.object({
  oppTeamId: z.string().regex(/^\d+$/, 'Opponent team ID must be a number').transform(Number),
});

const GameResultSchema = z.object({
  teamScore: z.number().min(0, 'Team score cannot be negative'),
  oppTeamScore: z.number().min(0, 'Opponent team score cannot be negative'),
  wonLostFlag: z.string().length(1, 'Won/Lost flag must be a single character'),
});

const QuerySchema = ScheduleFiltersDtoSchema.merge(PaginationDtoSchema);

// Routes
router.post(
  '/',
  validateBody(CreateScheduleDtoSchema),
  scheduleController.createSchedule
);

router.get(
  '/',
  validateQuery(QuerySchema),
  scheduleController.getAllSchedules
);

router.get(
  '/upcoming',
  scheduleController.getUpcomingGames
);

router.get(
  '/completed',
  scheduleController.getCompletedGames
);

router.get(
  '/team/:teamId/season/:seasonYear',
  validateParams(TeamSeasonParamsSchema),
  scheduleController.getTeamSchedule
);

router.get(
  '/opponent/:oppTeamId',
  validateParams(OpponentParamsSchema),
  scheduleController.getOpponentHistory
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  scheduleController.getScheduleById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateScheduleDtoSchema),
  scheduleController.updateSchedule
);

router.patch(
  '/:id/result',
  validateParams(IdParamsSchema),
  validateBody(GameResultSchema),
  scheduleController.updateGameResult
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  scheduleController.deleteSchedule
);

export { router as scheduleRoutes };