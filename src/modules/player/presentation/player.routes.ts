import { Router } from 'express';
import { PlayerController } from './player.controller';
import { PlayerService } from '../application/player.service';
import { PlayerPrismaRepository } from '../infrastructure/persistence/player.prisma.repository';

// Initialize dependencies
const playerRepository = new PlayerPrismaRepository();
const playerService = new PlayerService(playerRepository);
const playerController = new PlayerController(playerService);

// Create router
const playerRouter = Router();

// src/modules/player/presentation/player.routes.ts
// Add these JSDoc comments before your routes
/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Retrieve a list of all players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: A list of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - position
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               position:
 *                 type: string
 *               height:
 *                 type: string
 *               weight:
 *                 type: number
 *               college:
 *                 type: string
 *     responses:
 *       201:
 *         description: Player created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               position:
 *                 type: string
 *               height:
 *                 type: string
 *               weight:
 *                 type: number
 *               college:
 *                 type: string
 *     responses:
 *       200:
 *         description: Player updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete a player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// Define routes
playerRouter.get('/', (req, res) => playerController.getAllPlayers(req, res));
playerRouter.get('/filter', (req, res) => playerController.getPlayersByFilters(req, res));
playerRouter.get('/team/:teamId', (req, res) => playerController.getPlayersByTeam(req, res));
playerRouter.get('/:id', (req, res) => playerController.getPlayerById(req, res));
playerRouter.post('/', (req, res) => playerController.createPlayer(req, res));
playerRouter.put('/:id', (req, res) => playerController.updatePlayer(req, res));
playerRouter.delete('/:id', (req, res) => playerController.deletePlayer(req, res));

export default playerRouter;
