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

import { EspnScheduleClient } from '../../infrastructure/espn/EspnScheduleClient';
import { GetWeekScheduleService } from '@/application/schedule/services/GetWeekScheduleService';


const weekScheduleService = new GetWeekScheduleService(new EspnScheduleClient());

const router = Router();

// Dependency injection
const scheduleRepository = new PrismaScheduleRepository();
const scheduleService = new ScheduleService(scheduleRepository);
const scheduleController = new ScheduleController(scheduleService);

// ---------------------
// Zod schemas (coerce + passthrough + defaults)
// ---------------------
const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
}).passthrough();

const TeamSeasonParamsSchema = z.object({
  teamId: z.coerce.number().int().positive(),
  // keep seasonYear numeric; change to string+regex if your controller expects a string
  seasonYear: z.coerce.number().int().min(1900).max(3000),
}).passthrough();

const OpponentParamsSchema = z.object({
  oppTeamId: z.coerce.number().int().positive(),
}).passthrough();

// Bodies often arrive as strings; coerce and validate
const GameResultSchema = z.object({
  teamScore: z.coerce.number().int().min(0, 'Team score cannot be negative'),
  oppTeamScore: z.coerce.number().int().min(0, 'Opponent team score cannot be negative'),
  wonLostFlag: z.string().length(1, 'Won/Lost flag must be a single character'),
}).passthrough();

// Keep your existing list filters, but allow extra keys
const QuerySchema = ScheduleFiltersDtoSchema.merge(PaginationDtoSchema).passthrough();

// Optional per-route query with sensible defaults
// (Use when you want defaults like regular season)
const ScheduleQuerySchema = z.object({
  week: z.coerce.number().int().min(0).max(25).optional(),
  seasonType: z.coerce.number().int().min(1).max(3).default(2), // 2 = regular season
}).passthrough();

// ---------------------
// Routes
// ---------------------
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

router.get('/upcomingSchedule', async (req, res) => {
  try {
    const year = Number(req.query.seasonYear)
    const seasonType = Number(req.query.seasonType)
    const week = Number(req.query.week)

    console.log('➡️ Incoming params:', { year, seasonType, week, raw: req.query })

    if (!year || !seasonType || !week) {
      return res.status(400).json({ success: false, message: 'Missing year, seasonType, or week' })
    }

    const result = await weekScheduleService.execute(year, seasonType, week)
    return res.json(result)
  } catch (err: any) {
    console.error('❌ /upcomingSchedule failed:', err)
    return res.status(500).json({ success: false, message: err.message, error: err.message })
  }
})

router.get('/upcomingGames', scheduleController.getUpcomingGames);

router.get('/completed', scheduleController.getCompletedGames);

router.get(
  '/team/:teamId/season/:seasonYear',
  validateParams(TeamSeasonParamsSchema),
  validateQuery(ScheduleQuerySchema), // ← adds seasonType default=2, optional week
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

