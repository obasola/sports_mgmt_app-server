// src/presentation/routes/playerTeamRoutes.ts
import { Router } from 'express';
import { PlayerTeamController } from '../controllers/PlayerTeamController';
import { PlayerTeamService } from '@/application/playerTeam/services/PlayerTeamService';
import { PrismaPlayerTeamRepository } from '@/infrastructure/repositories/PrismaPlayerTeamRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreatePlayerTeamDtoSchema,
  UpdatePlayerTeamDtoSchema,
  PlayerTeamFiltersDtoSchema,
  PaginationDtoSchema,
} from '@/application/playerTeam/dto/PlayerTeamDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const playerTeamRepository = new PrismaPlayerTeamRepository();
const playerTeamService = new PlayerTeamService(playerTeamRepository);
const playerTeamController = new PlayerTeamController(playerTeamService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const PlayerIdParamsSchema = z.object({
  playerId: z.string().regex(/^\d+$/, 'Player ID must be a number').transform(Number),
});

const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

const JerseyCheckParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
  jerseyNumber: z.string().regex(/^\d+$/, 'Jersey number must be a number').transform(Number),
});

const TransferPlayerDtoSchema = z.object({
  newTeamId: z.number().positive('New team ID is required'),
  jerseyNumber: z.number().min(0).max(99).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  contractValue: z.number().min(0).optional(),
  contractLength: z.number().min(1).max(10).optional(),
});

const QuerySchema = PlayerTeamFiltersDtoSchema.merge(PaginationDtoSchema);

const JerseyAvailabilityQuerySchema = z.object({
  excludeId: z.string().regex(/^\d+$/, 'Exclude ID must be a number').transform(Number).optional(),
});

const TeamRosterQuerySchema = z.object({
  currentOnly: z.string().transform((val) => val === 'true').optional(),
});

// Standard CRUD Routes
router.post(
  '/',
  validateBody(CreatePlayerTeamDtoSchema),
  playerTeamController.createPlayerTeam
);

router.get(
  '/',
  validateQuery(QuerySchema),
  playerTeamController.getAllPlayerTeams
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  playerTeamController.getPlayerTeamById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdatePlayerTeamDtoSchema),
  playerTeamController.updatePlayerTeam
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  playerTeamController.deletePlayerTeam
);

// Domain-specific Routes

// Get player history (all teams they've played for)
router.get(
  '/player/:playerId/history',
  validateParams(PlayerIdParamsSchema),
  playerTeamController.getPlayerHistory
);

// Get current team for a player
router.get(
  '/player/:playerId/current',
  validateParams(PlayerIdParamsSchema),
  playerTeamController.getCurrentTeamForPlayer
);

// Get team roster (current or for specific season)
router.get(
  '/team/:teamId/roster',
  validateParams(TeamIdParamsSchema),
  validateQuery(TeamRosterQuerySchema),
  playerTeamController.getTeamRoster
);

// Get all current team contracts
router.get(
  '/contracts/current',
  playerTeamController.getCurrentTeamContracts
);

// Check jersey number availability for a team
router.get(
  '/team/:teamId/jersey/:jerseyNumber/availability',
  validateParams(JerseyCheckParamsSchema),
  validateQuery(JerseyAvailabilityQuerySchema),
  playerTeamController.checkJerseyNumberAvailability
);

// Transfer player to new team
router.post(
  '/player/:playerId/transfer',
  validateParams(PlayerIdParamsSchema),
  validateBody(TransferPlayerDtoSchema),
  playerTeamController.transferPlayer
);

export { router as playerTeamRoutes };