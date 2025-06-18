// src/presentation/routes/postSeasonResultRoutes.ts
import { Router } from 'express';
import { PostSeasonResultController } from '../controllers/PostSeasonResultController';
import { PostSeasonResultService } from '@/application/postSeasonResult/services/PostSeasonResultService';
import { PrismaPostSeasonResultRepository } from '@/infrastructure/repositories/PrismaPostSeasonResultRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreatePostSeasonResultDtoSchema,
  UpdatePostSeasonResultDtoSchema,
  PostSeasonResultFiltersDtoSchema,
  PaginationDtoSchema,
  TeamPlayoffHistoryQuerySchema,
  PlayoffYearQuerySchema,
} from '@/application/postSeasonResult/dto/PostSeasonResultDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const postSeasonResultRepository = new PrismaPostSeasonResultRepository();
const postSeasonResultService = new PostSeasonResultService(postSeasonResultRepository);
const postSeasonResultController = new PostSeasonResultController(postSeasonResultService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

const YearParamsSchema = z.object({
  year: z.string().regex(/^\d+$/, 'Year must be a number').transform(Number),
});

// Query schemas
const QuerySchema = PostSeasonResultFiltersDtoSchema.merge(PaginationDtoSchema);
const TeamHistoryQuerySchema = z.object({
  year: z.string().regex(/^\d+$/, 'Year must be a number').transform(Number).optional(),
});

// ============================
// MAIN CRUD ROUTES
// ============================

// POST /api/v1/postseason-results - Create new postseason result
router.post(
  '/',
  validateBody(CreatePostSeasonResultDtoSchema),
  postSeasonResultController.createPostSeasonResult
);

// GET /api/v1/postseason-results - Get all postseason results with filtering and pagination
router.get(
  '/',
  validateQuery(QuerySchema),
  postSeasonResultController.getAllPostSeasonResults
);

// GET /api/v1/postseason-results/:id - Get specific postseason result by ID
router.get(
  '/:id',
  validateParams(IdParamsSchema),
  postSeasonResultController.getPostSeasonResultById
);

// PUT /api/v1/postseason-results/:id - Update specific postseason result
router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdatePostSeasonResultDtoSchema),
  postSeasonResultController.updatePostSeasonResult
);

// DELETE /api/v1/postseason-results/:id - Delete specific postseason result
router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  postSeasonResultController.deletePostSeasonResult
);

// ============================
// DOMAIN-SPECIFIC ROUTES
// ============================

// GET /api/v1/postseason-results/team/:teamId/history - Get team's playoff history
router.get(
  '/team/:teamId/history',
  validateParams(TeamIdParamsSchema),
  validateQuery(TeamHistoryQuerySchema),
  postSeasonResultController.getTeamPlayoffHistory
);

// GET /api/v1/postseason-results/team/:teamId/wins - Get team's playoff wins
router.get(
  '/team/:teamId/wins',
  validateParams(TeamIdParamsSchema),
  postSeasonResultController.getTeamWins
);

// GET /api/v1/postseason-results/team/:teamId/losses - Get team's playoff losses
router.get(
  '/team/:teamId/losses',
  validateParams(TeamIdParamsSchema),
  postSeasonResultController.getTeamLosses
);

// GET /api/v1/postseason-results/team/:teamId/stats - Get team's playoff statistics
router.get(
  '/team/:teamId/stats',
  validateParams(TeamIdParamsSchema),
  postSeasonResultController.getTeamPlayoffStats
);

// GET /api/v1/postseason-results/year/:year - Get all playoff results for a specific year
router.get(
  '/year/:year',
  validateParams(YearParamsSchema),
  postSeasonResultController.getPlayoffResultsByYear
);

export { router as postSeasonResultRoutes };

/*
==================================================
API ENDPOINT DOCUMENTATION
==================================================

BASE URL: /api/v1/postseason-results

MAIN CRUD ENDPOINTS:
====================

POST /
- Create new postseason result
- Body: CreatePostSeasonResultDto
- Response: PostSeasonResultResponseDto

GET /
- Get all postseason results with filtering and pagination
- Query params: teamId?, playoffYear?, lastRoundReached?, winLose?, page?, limit?
- Response: PaginatedResponse<PostSeasonResultResponseDto>

GET /:id
- Get specific postseason result by ID
- Params: id (number)
- Response: PostSeasonResultResponseDto

PUT /:id
- Update specific postseason result
- Params: id (number)
- Body: UpdatePostSeasonResultDto
- Response: PostSeasonResultResponseDto

DELETE /:id
- Delete specific postseason result
- Params: id (number)
- Response: Success message

DOMAIN-SPECIFIC ENDPOINTS:
==========================

GET /team/:teamId/history
- Get team's complete playoff history
- Params: teamId (number)
- Query: year? (number) - filter by specific year
- Response: PostSeasonResultResponseDto[]

GET /team/:teamId/wins
- Get all playoff wins for a team
- Params: teamId (number)
- Response: PostSeasonResultResponseDto[]

GET /team/:teamId/losses
- Get all playoff losses for a team
- Params: teamId (number)
- Response: PostSeasonResultResponseDto[]

GET /team/:teamId/stats
- Get playoff statistics for a team
- Params: teamId (number)
- Response: { totalGames, wins, losses, winPercentage, averageScoreDifferential }

GET /year/:year
- Get all playoff results for a specific year
- Params: year (number)
- Response: PostSeasonResultResponseDto[]

EXAMPLE REQUESTS:
=================

1. Create postseason result:
POST /api/v1/postseason-results
{
  "teamId": 1,
  "playoffYear": 2023,
  "lastRoundReached": "CCG",
  "winLose": "L",
  "teamScore": 21,
  "opponentScore": 28
}

2. Get team playoff history:
GET /api/v1/postseason-results/team/1/history?year=2023

3. Get playoff results by year:
GET /api/v1/postseason-results/year/2023

4. Filter results:
GET /api/v1/postseason-results?teamId=1&winLose=W&page=1&limit=20
*/