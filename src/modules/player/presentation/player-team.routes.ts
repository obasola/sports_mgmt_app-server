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
