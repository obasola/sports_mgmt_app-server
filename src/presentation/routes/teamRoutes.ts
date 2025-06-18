// src/presentation/routes/teamRoutes.ts
import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { TeamService } from '@/application/team/services/TeamService';
import { PrismaTeamRepository } from '@/infrastructure/repositories/PrismaTeamRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateTeamDtoSchema,
  UpdateTeamDtoSchema,
  TeamFiltersDtoSchema,
  PaginationDtoSchema,
} from '@/application/team/dto/TeamDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const teamRepository = new PrismaTeamRepository();
const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const NameParamsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(45, 'Name too long'),
});

const ConferenceParamsSchema = z.object({
  conference: z.string().min(1, 'Conference is required').max(45, 'Conference name too long'),
});

const DivisionParamsSchema = z.object({
  division: z.string().min(1, 'Division is required').max(45, 'Division name too long'),
});

const StateParamsSchema = z.object({
  state: z.string().min(1, 'State is required').max(45, 'State name too long'),
});

const ScheduleIdParamsSchema = z.object({
  scheduleId: z.string().regex(/^\d+$/, 'Schedule ID must be a number').transform(Number),
});

const QuerySchema = TeamFiltersDtoSchema.merge(PaginationDtoSchema);

// CRUD Routes
router.post(
  '/',
  validateBody(CreateTeamDtoSchema),
  teamController.createTeam
);

router.get(
  '/',
  validateQuery(QuerySchema),
  teamController.getAllTeams
);

router.get(
  '/stats',
  teamController.getTeamStats
);

router.get(
  '/with-schedules',
  teamController.getTeamsWithSchedules
);

router.get(
  '/without-schedules',
  teamController.getTeamsWithoutSchedules
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  teamController.getTeamById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateTeamDtoSchema),
  teamController.updateTeam
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  teamController.deleteTeam
);

// Domain-specific query routes
router.get(
  '/name/:name',
  validateParams(NameParamsSchema),
  teamController.getTeamByName
);

router.get(
  '/conference/:conference',
  validateParams(ConferenceParamsSchema),
  teamController.getTeamsByConference
);

router.get(
  '/division/:division',
  validateParams(DivisionParamsSchema),
  teamController.getTeamsByDivision
);

router.get(
  '/state/:state',
  validateParams(StateParamsSchema),
  teamController.getTeamsByState
);

router.get(
  '/schedule/:scheduleId',
  validateParams(ScheduleIdParamsSchema),
  teamController.getTeamByScheduleId
);

export { router as teamRoutes };