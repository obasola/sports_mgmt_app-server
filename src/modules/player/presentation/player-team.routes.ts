import { Router } from 'express';
import { PlayerTeamController } from './player-team.controller';
import { PlayerTeamService } from '../application/player-team.service';
import { PlayerTeamPrismaRepository } from '../infrastructure/persistence/player-team.prisma.repository';

// Initialize dependencies
const playerTeamRepository = new PlayerTeamPrismaRepository();
const playerTeamService = new PlayerTeamService(playerTeamRepository);
const playerTeamController = new PlayerTeamController(playerTeamService);

// Create router
const playerTeamRouter = Router();
// src/modules/playerTeam/presentation/playerTeam.routes.ts
/**
 * @swagger
 * /api/player-teams:
 *   get:
 *     summary: Retrieve all player-team relationships
 *     tags: [PlayerTeams]
 *     responses:
 *       200:
 *         description: A list of player-team relationships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerTeam'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Add a player to a team
 *     tags: [PlayerTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - teamId
 *               - startDate
 *             properties:
 *               playerId:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Player added to team successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerTeam'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/player-teams/{id}:
 *   get:
 *     summary: Get a player-team relationship by ID
 *     tags: [PlayerTeams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The relationship ID
 *     responses:
 *       200:
 *         description: Player-team relationship details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerTeam'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/player-teams/player/{playerId}/history:
 *   get:
 *     summary: Get team history for a player
 *     tags: [PlayerTeams]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Team history for the player
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerTeam'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/player-teams/team/{teamId}/roster:
 *   get:
 *     summary: Get current roster for a team
 *     tags: [PlayerTeams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Current team roster
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerTeam'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// Define routes
playerTeamRouter.get('/:id', (req, res) => playerTeamController.getPlayerTeamById(req, res));
playerTeamRouter.get('/player/:playerId/history', (req, res) =>
  playerTeamController.getTeamHistoryForPlayer(req, res),
);
playerTeamRouter.get('/player/:playerId/current-team', (req, res) =>
  playerTeamController.getCurrentTeamForPlayer(req, res),
);
playerTeamRouter.get('/team/:teamId/history', (req, res) =>
  playerTeamController.getPlayerHistoryForTeam(req, res),
);
playerTeamRouter.get('/team/:teamId/roster', (req, res) =>
  playerTeamController.getCurrentRosterForTeam(req, res),
);
playerTeamRouter.post('/', (req, res) => playerTeamController.addPlayerToTeam(req, res));
playerTeamRouter.post('/transfer', (req, res) => playerTeamController.transferPlayer(req, res));
playerTeamRouter.put('/:id', (req, res) => playerTeamController.updatePlayerTeam(req, res));
playerTeamRouter.delete('/:id', (req, res) => playerTeamController.deletePlayerTeam(req, res));
playerTeamRouter.delete('/player/:playerId/remove', (req, res) =>
  playerTeamController.removePlayerFromTeam(req, res),
);

export default playerTeamRouter;
