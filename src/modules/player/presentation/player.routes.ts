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

// Define routes
playerRouter.get('/', (req, res) => playerController.getAllPlayers(req, res));
playerRouter.get('/filter', (req, res) => playerController.getPlayersByFilters(req, res));
playerRouter.get('/team/:teamId', (req, res) => playerController.getPlayersByTeam(req, res));
playerRouter.get('/:id', (req, res) => playerController.getPlayerById(req, res));
playerRouter.post('/', (req, res) => playerController.createPlayer(req, res));
playerRouter.put('/:id', (req, res) => playerController.updatePlayer(req, res));
playerRouter.delete('/:id', (req, res) => playerController.deletePlayer(req, res));

export default playerRouter;
