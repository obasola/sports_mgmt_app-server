// src/modules/draftPick/presentation/draftPick.routes.ts
import { Router } from 'express';
import { validateParam, validateBody } from '@/shared/infrastructure/middleware/validation';
import Joi from 'joi';
import { DraftPickService } from '../application/draft-pick.service';
import { DraftPickPrismaRepository } from '../infrastructure/persistence/draft-pick.prisma.repository';
import { DraftPickController } from './draft-pick.controller';

// Create router instance
export const draftPickRouter = Router();

// Initialize dependencies

const draftPickRepository = new DraftPickPrismaRepository();
const draftPickService = new DraftPickService(draftPickRepository);
const draftPickController = new DraftPickController(draftPickService);

/**
 * @swagger
 * /api/draft-picks:
 *   get:
 *     summary: Retrieve all draft picks
 *     tags: [DraftPicks]
 *     responses:
 *       200:
 *         description: A list of all draft picks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPick'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/', (req, res) => draftPickController.getAllDraftPicks(req, res));

/**
 * @swagger
 * /api/draft-picks/with-details:
 *   get:
 *     summary: Get all draft picks with player and team details
 *     tags: [DraftPicks]
 *     responses:
 *       200:
 *         description: A list of draft picks with related details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   draftYear:
 *                     type: integer
 *                   round:
 *                     type: integer
 *                   pickNumber:
 *                     type: integer
 *                   playerId:
 *                     type: integer
 *                     nullable: true
 *                   teamId:
 *                     type: integer
 *                   playerFirstName:
 *                     type: string
 *                     nullable: true
 *                   playerLastName:
 *                     type: string
 *                     nullable: true
 *                   teamName:
 *                     type: string
 *                     nullable: true
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/with-details', (req, res) =>
  draftPickController.getDraftPicksWithDetails(req, res),
);

/**
 * @swagger
 * /api/draft-picks/with-all-team-history:
 *   get:
 *     summary: Get all draft picks with complete team history
 *     description: Returns all draft picks with details of all teams a player has been on
 *     tags: [DraftPicks]
 *     responses:
 *       200:
 *         description: A list of draft picks with complete team history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   draftYear:
 *                     type: integer
 *                   round:
 *                     type: integer
 *                   pickNumber:
 *                     type: integer
 *                   playerId:
 *                     type: integer
 *                     nullable: true
 *                   teamId:
 *                     type: integer
 *                     nullable: true
 *                   playerFirstName:
 *                     type: string
 *                     nullable: true
 *                   playerLastName:
 *                     type: string
 *                     nullable: true
 *                   teamName:
 *                     type: string
 *                     nullable: true
 *                   playerTeamStartDate:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   playerTeamEndDate:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/with-all-team-history', (req, res) =>
  draftPickController.getDraftPicksWithAllTeamHistory(req, res),
);

/**
 * @swagger
 * /api/draft-picks/with-drafting-team:
 *   get:
 *     summary: Get all draft picks with their drafting team information
 *     description: Returns draft picks with the team that originally drafted each player
 *     tags: [DraftPicks]
 *     responses:
 *       200:
 *         description: A list of draft picks with drafting team information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   draftYear:
 *                     type: integer
 *                   round:
 *                     type: integer
 *                   pickNumber:
 *                     type: integer
 *                   playerId:
 *                     type: integer
 *                     nullable: true
 *                   teamId:
 *                     type: integer
 *                     nullable: true
 *                   playerFirstName:
 *                     type: string
 *                     nullable: true
 *                   playerLastName:
 *                     type: string
 *                     nullable: true
 *                   teamName:
 *                     type: string
 *                     nullable: true
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/with-drafting-team', (req, res) =>
  draftPickController.getDraftPicksWithDraftingTeam(req, res),
);

/**
 * @swagger
 * /api/draft-picks/{id}:
 *   get:
 *     summary: Get a draft pick by ID
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the draft pick
 *     responses:
 *       200:
 *         description: Draft pick details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DraftPick'
 *       404:
 *         description: Draft pick not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/:id', validateParam('id', 'number'), (req, res) =>
  draftPickController.getDraftPickById(req, res),
);

/**
 * @swagger
 * /api/draft-picks/year/{year}:
 *   get:
 *     summary: Get draft picks by year
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: The draft year
 *     responses:
 *       200:
 *         description: Draft picks for the specified year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPick'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/year/:year', validateParam('year', 'number'), (req, res) =>
  draftPickController.getDraftPicksByYear(req, res),
);

/**
 * @swagger
 * /api/draft-picks/team/{teamId}:
 *   get:
 *     summary: Get draft picks by team
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Draft picks for the specified team
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPick'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/team/:teamId', validateParam('teamId', 'number'), (req, res) =>
  draftPickController.getDraftPicksByTeam(req, res),
);

/**
 * @swagger
 * /api/draft-picks/player/{playerId}:
 *   get:
 *     summary: Get draft picks by player
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Draft pick for the specified player
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPick'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/player/:playerId', validateParam('playerId', 'number'), (req, res) =>
  draftPickController.getDraftPickByPlayer(req, res),
);

/**
 * @swagger
 * /api/draft-picks/year/{year}/round/{round}:
 *   get:
 *     summary: Get draft picks by year and round
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: round
 *         schema:
 *           type: integer
 *         required: true
 *         description: The draft round
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: The draft year
 *     responses:
 *       200:
 *         description: Draft picks for the specified round and year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPick'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get(
  '/round/:round/year/:year',
  validateParam('round', 'number'),
  validateParam('year', 'number'),
  (req, res) => draftPickController.getDraftPickByRoundPickYear(req, res),
);

/**
 * @swagger
 * /api/draft-picks/year/{year}/with-details:
 *   get:
 *     summary: Get draft picks for a specific year with details
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: The draft year
 *     responses:
 *       200:
 *         description: Draft picks for the specified year with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPickWithDetails'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/year/:year/with-details', validateParam('year', 'number'), (req, res) =>
  draftPickController.getDraftPicksByYearWithDetails(req, res),
);

/**
 * @swagger
 * /api/draft-picks/team/{teamId}/with-details:
 *   get:
 *     summary: Get draft picks for a specific team with details
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Draft picks for the specified team with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DraftPickWithDetails'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.get('/team/:teamId/with-details', validateParam('teamId', 'number'), (req, res) =>
  draftPickController.getDraftPicksByTeamWithDetails(req, res),
);

/**
 * @swagger
 * /api/draft-picks:
 *   post:
 *     summary: Create a new draft pick
 *     tags: [DraftPicks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - round
 *               - pick
 *               - teamId
 *             properties:
 *               year:
 *                 type: integer
 *                 description: The draft year
 *               round:
 *                 type: integer
 *                 description: The draft round
 *               pick:
 *                 type: integer
 *                 description: The pick number within the round
 *               teamId:
 *                 type: integer
 *                 description: The team making the pick
 *               playerId:
 *                 type: integer
 *                 description: The player selected (can be null if pick not yet used)
 *                 nullable: true
 *               prospectId:
 *                 type: integer
 *                 description: Associated prospect ID
 *                 nullable: true
 *               tradedFrom:
 *                 type: integer
 *                 description: Original team if pick was traded
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Draft pick created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DraftPick'
 *       400:
 *         description: Invalid input
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.post('/', (req, res) => draftPickController.createDraftPick(req, res));

/**
 * @swagger
 * /api/draft-picks/{id}:
 *   put:
 *     summary: Update a draft pick
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the draft pick
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               round:
 *                 type: integer
 *               pick:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *               playerId:
 *                 type: integer
 *                 nullable: true
 *               prospectId:
 *                 type: integer
 *                 nullable: true
 *               tradedFrom:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Draft pick updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DraftPick'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Draft pick not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.put('/:id', (req, res) => draftPickController.updateDraftPick(req, res));

/**
 * @swagger
 * /api/draft-picks/{id}/trade:
 *   put:
 *     summary: Trade a draft pick to another team
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the draft pick
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newTeamId
 *             properties:
 *               newTeamId:
 *                 type: integer
 *                 description: The new team ID receiving the pick
 *     responses:
 *       200:
 *         description: Draft pick traded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DraftPick'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Draft pick not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.put(
  '/:id/trade',
  validateParam('id', 'number'),
  validateBody(
    Joi.object({
      newTeamId: Joi.number().integer().required(),
    }),
  ),
  (req, res) => draftPickController.tradeDraftPick(req, res),
);

/**
 * @swagger
 * /api/draft-picks/{id}:
 *   delete:
 *     summary: Delete a draft pick
 *     tags: [DraftPicks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the draft pick
 *     responses:
 *       200:
 *         description: Draft pick deleted successfully
 *       404:
 *         description: Draft pick not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
draftPickRouter.delete('/:id', validateParam('id', 'number'), (req, res) =>
  draftPickController.deleteDraftPick(req, res),
);

// Note: You would need to create the validation schemas in src/modules/draftPick/presentation/draftPick.schema.ts
// This is just an example of what it would look like
/*
import Joi from 'joi';

export const draftPickSchema = Joi.object({
  year: Joi.number().integer().required(),
  round: Joi.number().integer().required(),
  pick: Joi.number().integer().required(),
  teamId: Joi.number().integer().required(),
  playerId: Joi.number().integer().allow(null),
  prospectId: Joi.number().integer().allow(null),
  tradedFrom: Joi.number().integer().allow(null)
});

export const draftPickUpdateSchema = Joi.object({
  year: Joi.number().integer(),
  round: Joi.number().integer(),
  pick: Joi.number().integer(),
  teamId: Joi.number().integer(),
  playerId: Joi.number().integer().allow(null),
  prospectId: Joi.number().integer().allow(null),
  tradedFrom: Joi.number().integer().allow(null)
}).min(1);
*/

export default draftPickRouter;
