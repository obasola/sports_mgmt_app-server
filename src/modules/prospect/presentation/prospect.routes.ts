import { Router } from 'express';
import { ProspectService } from '../application/prospect.service';
import { ProspectPrismaRepository } from '../infrastructure/persistence/prospect.prisma.repository';
import { ProspectController } from './prospect.controller';

// Initialize dependencies
const prospectRepository = new ProspectPrismaRepository();
const prospectService = new ProspectService(prospectRepository);
const prospectController = new ProspectController(prospectService);

// Create router
const prospectRouter = Router();

// Define routes
prospectRouter.get('/', (req, res) => prospectController.getAllProspects(req, res));
prospectRouter.get('/filter', (req, res) => prospectController.getProspectsByFilters(req, res));
prospectRouter.get('/search', (req, res) => prospectController.searchProspectsByName(req, res));
prospectRouter.get('/undrafted', (req, res) => prospectController.getUndraftedProspects(req, res));
prospectRouter.get('/position/:position', (req, res) =>
  prospectController.getProspectsByPosition(req, res),
);
prospectRouter.get('/college/:college', (req, res) =>
  prospectController.getProspectsByCollege(req, res),
);
prospectRouter.get('/team/:teamId', (req, res) => prospectController.getProspectsByTeam(req, res));
prospectRouter.get('/draft-year/:draftYear', (req, res) =>
  prospectController.getProspectsByDraftYear(req, res),
);
prospectRouter.get('/draft-pick/:draftPickId', (req, res) =>
  prospectController.getProspectByDraftPick(req, res),
);
prospectRouter.get('/:id', (req, res) => prospectController.getProspectById(req, res));
prospectRouter.post('/', (req, res) => prospectController.createProspect(req, res));
prospectRouter.put('/:id', (req, res) => prospectController.updateProspect(req, res));
prospectRouter.put('/:id/draft', (req, res) => prospectController.draftProspect(req, res));
prospectRouter.put('/:id/combine', (req, res) => prospectController.updateCombineResults(req, res));
prospectRouter.delete('/:id', (req, res) => prospectController.deleteProspect(req, res));

export default prospectRouter;
