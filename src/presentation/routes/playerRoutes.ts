// src/presentation/routes/playerRoutes.ts
import { Router } from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { PlayerService } from '@/application/player/services/PlayerService';
import { PrismaPlayerRepository } from '@/infrastructure/repositories/PrismaPlayerRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreatePlayerDtoSchema,
  UpdatePlayerDtoSchema,
  PlayerFiltersDtoSchema,
  PaginationDtoSchema,
  PlayerSearchDtoSchema,
  PlayerPhysicalRangeDtoSchema,
  PlayerBulkUpdateDtoSchema,
} from '@/application/player/dto/PlayerDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const playerRepository = new PrismaPlayerRepository();
const playerService = new PlayerService(playerRepository);
const playerController = new PlayerController(playerService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const PositionParamsSchema = z.object({
  position: z.string().min(1, 'Position is required'),
});

const UniversityParamsSchema = z.object({
  university: z.string().min(1, 'University is required'),
});

const ProspectIdParamsSchema = z.object({
  prospectId: z.string().regex(/^\d+$/, 'Prospect ID must be a number').transform(Number),
});

const YearParamsSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number').transform(Number),
});

const StatusParamsSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

// Query schemas
const PlayerQuerySchema = PlayerFiltersDtoSchema.merge(PaginationDtoSchema);
const SearchQuerySchema = PlayerSearchDtoSchema;
const PhysicalRangeQuerySchema = PlayerPhysicalRangeDtoSchema;

const LocationQuerySchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
});

const VeteransQuerySchema = z.object({
  minYears: z.string().regex(/^\d+$/, 'Minimum years must be a number').transform(Number).optional(),
});

// Add this to your existing playerRoutes.ts file

// 1. Add this new schema with your other parameter validation schemas
const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

// 2. Add this route in your filter routes section (around line 90-120)
router.get(
  '/team/:teamId',
  validateParams(TeamIdParamsSchema),
  playerController.getPlayersByTeam
);

// That's it! Your route will now be: GET /api/v1/players/team/:teamId
// Main CRUD routes
router.post(
  '/',
  validateBody(CreatePlayerDtoSchema),
  playerController.createPlayer
);

router.get(
  '/',
  validateQuery(PlayerQuerySchema),
  playerController.getAllPlayers
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  playerController.getPlayerById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdatePlayerDtoSchema),
  playerController.updatePlayer
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  playerController.deletePlayer
);

// Search and filter routes
router.get(
  '/search/query',
  validateQuery(SearchQuerySchema),
  playerController.searchPlayers
);

router.get(
  '/filter/position/:position',
  validateParams(PositionParamsSchema),
  playerController.getPlayersByPosition
);

router.get(
  '/filter/university/:university',
  validateParams(UniversityParamsSchema),
  playerController.getPlayersByUniversity
);

router.get(
  '/filter/prospect/:prospectId',
  validateParams(ProspectIdParamsSchema),
  playerController.getPlayerByProspectId
);

router.get(
  '/filter/rookies',
  playerController.getRookies
);

router.get(
  '/filter/veterans',
  validateQuery(VeteransQuerySchema),
  playerController.getVeterans
);

router.get(
  '/filter/year/:year',
  validateParams(YearParamsSchema),
  playerController.getPlayersByYearEnteredLeague
);

router.get(
  '/filter/status/:status',
  validateParams(StatusParamsSchema),
  playerController.getPlayersByStatus
);

router.get(
  '/filter/location',
  validateQuery(LocationQuerySchema),
  playerController.getPlayersByLocation
);

router.get(
  '/filter/physical-range',
  validateQuery(PhysicalRangeQuerySchema),
  playerController.getPlayersByPhysicalRange
);

// Statistics routes
router.get(
  '/statistics/overview',
  playerController.getPlayerStatistics
);

router.get(
  '/statistics/position/:position',
  validateParams(PositionParamsSchema),
  playerController.getPositionStatistics
);

// Bulk operations
router.patch(
  '/bulk/update',
  validateBody(PlayerBulkUpdateDtoSchema),
  playerController.bulkUpdatePlayers
);

export { router as playerRoutes };