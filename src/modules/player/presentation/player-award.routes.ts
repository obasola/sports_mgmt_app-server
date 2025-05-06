// src/modules/playerAward/presentation/playerAward.routes.ts
import { Router } from 'express';
//import { PrismaClient } from '@prisma/client';
import { PlayerAwardService } from '../application/player-award.service';
import { PlayerAwardPrismaRepository } from '../infrastructure/persistence/player-award.prisma.repository';
import { PlayerAwardController } from './player-award.controller';

export const playerAwardRouter = Router();

//const prisma = new PrismaClient();
const playerAwardRepository = new PlayerAwardPrismaRepository();
const playerAwardService = new PlayerAwardService(playerAwardRepository);
const playerAwardController = new PlayerAwardController(playerAwardService);

// src/modules/playerAward/presentation/playerAward.routes.ts
/**
 * @swagger
 * /api/player-awards:
 *   get:
 *     summary: Retrieve all player awards
 *     tags: [PlayerAwards]
 *     responses:
 *       200:
 *         description: A list of player awards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerAward'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create a new player award
 *     tags: [PlayerAwards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *             properties:
 *               playerId:
 *                 type: integer
 *               awardName:
 *                 type: string
 *               yearAwarded:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Player award created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerAward'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/player-awards/{id}:
 *   get:
 *     summary: Get a player award by ID
 *     tags: [PlayerAwards]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The award ID
 *     responses:
 *       200:
 *         description: Player award details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerAward'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// Routes
playerAwardRouter.get('/', (req, res) => playerAwardController.getAllPlayerAwards(req, res));
playerAwardRouter.get('/:id', (req, res) => playerAwardController.getPlayerAwardById(req, res));
playerAwardRouter.get('/player/:playerId', (req, res) =>
  playerAwardController.getPlayerAwardsByPlayerId(req, res),
);
playerAwardRouter.post('/', (req, res) => playerAwardController.createPlayerAward(req, res));
playerAwardRouter.put('/:id', (req, res) => playerAwardController.updatePlayerAward(req, res));
playerAwardRouter.delete('/:id', (req, res) => playerAwardController.deletePlayerAward(req, res));
