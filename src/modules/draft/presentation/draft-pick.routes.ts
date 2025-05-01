import { Router } from 'express';
import { DraftPickController } from './draft-pick.controller';
import { DraftPickService } from '../application/draft-pick.service';
import { DraftPickPrismaRepository } from '../infrastructure/persistence/draft-pick.prisma.repository';

// Initialize dependencies
const draftPickRepository = new DraftPickPrismaRepository();
const draftPickService = new DraftPickService(draftPickRepository);
const draftPickController = new DraftPickController(draftPickService);

// Create router
const draftPickRouter = Router();

// Define routes
draftPickRouter.get('/', (req, res) => draftPickController.getAllDraftPicks(req, res));
draftPickRouter.get('/filter', (req, res) => draftPickController.getDraftPicksByFilters(req, res));
draftPickRouter.get('/year/:year', (req, res) => draftPickController.getDraftPicksByYear(req, res));
draftPickRouter.get('/team/:teamId', (req, res) =>
  draftPickController.getDraftPicksByTeam(req, res),
);
draftPickRouter.get('/team/:teamId/unused', (req, res) =>
  draftPickController.getUnusedDraftPicksByTeam(req, res),
);
draftPickRouter.get('/prospect/:prospectId', (req, res) =>
  draftPickController.getDraftPickByProspect(req, res),
);
draftPickRouter.get('/player/:playerId', (req, res) =>
  draftPickController.getDraftPickByPlayer(req, res),
);
draftPickRouter.get('/round/:round/pick/:pickNumber/year/:draftYear', (req, res) =>
  draftPickController.getDraftPickByRoundPickYear(req, res),
);
draftPickRouter.get('/:id', (req, res) => draftPickController.getDraftPickById(req, res));
draftPickRouter.post('/', (req, res) => draftPickController.createDraftPick(req, res));
draftPickRouter.put('/:id', (req, res) => draftPickController.updateDraftPick(req, res));
draftPickRouter.put('/:id/use', (req, res) =>
  draftPickController.useDraftPickForProspect(req, res),
);
draftPickRouter.put('/:id/trade', (req, res) => draftPickController.tradeDraftPick(req, res));
draftPickRouter.put('/:id/original-team', (req, res) =>
  draftPickController.setOriginalTeam(req, res),
);
draftPickRouter.put('/:id/reset', (req, res) => draftPickController.resetDraftPick(req, res));
draftPickRouter.delete('/:id', (req, res) => draftPickController.deleteDraftPick(req, res));

export default draftPickRouter;
