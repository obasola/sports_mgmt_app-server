import { Router } from 'express';
import { CombineScoreController } from './combine-score.controller';
import { CombineScoreService } from '../application/combine-score.service';
import { CombineScorePrismaRepository } from '../infrastructure/persistence/combine-score.prisma.repository';

// Initialize dependencies
const combineScoreRepository = new CombineScorePrismaRepository();
const combineScoreService = new CombineScoreService(combineScoreRepository);
const combineScoreController = new CombineScoreController(combineScoreService);

// Create router
const combineScoreRouter = Router();

// Define routes
combineScoreRouter.get('/', (req, res) => combineScoreController.getAllCombineScores(req, res));
combineScoreRouter.get('/filter', (req, res) =>
  combineScoreController.getCombineScoresByFilters(req, res),
);
combineScoreRouter.get('/player/:playerId', (req, res) =>
  combineScoreController.getCombineScoreByPlayerId(req, res),
);
combineScoreRouter.get('/:id', (req, res) => combineScoreController.getCombineScoreById(req, res));
combineScoreRouter.post('/', (req, res) => combineScoreController.createCombineScore(req, res));
combineScoreRouter.put('/:id', (req, res) => combineScoreController.updateCombineScore(req, res));
combineScoreRouter.put('/:id/speed', (req, res) =>
  combineScoreController.updateSpeedMetrics(req, res),
);
combineScoreRouter.put('/:id/jump', (req, res) =>
  combineScoreController.updateJumpMetrics(req, res),
);
combineScoreRouter.put('/:id/player', (req, res) => combineScoreController.linkToPlayer(req, res));
combineScoreRouter.delete('/:id', (req, res) =>
  combineScoreController.deleteCombineScore(req, res),
);

export default combineScoreRouter;
