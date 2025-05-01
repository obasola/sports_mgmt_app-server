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

// Routes
playerAwardRouter.get('/', (req, res) => playerAwardController.getAllPlayerAwards(req, res));
playerAwardRouter.get('/:id', (req, res) => playerAwardController.getPlayerAwardById(req, res));
playerAwardRouter.get('/player/:playerId', (req, res) =>
  playerAwardController.getPlayerAwardsByPlayerId(req, res),
);
playerAwardRouter.post('/', (req, res) => playerAwardController.createPlayerAward(req, res));
playerAwardRouter.put('/:id', (req, res) => playerAwardController.updatePlayerAward(req, res));
playerAwardRouter.delete('/:id', (req, res) => playerAwardController.deletePlayerAward(req, res));
