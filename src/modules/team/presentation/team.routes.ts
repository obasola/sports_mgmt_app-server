import { Router } from 'express';
import { TeamController } from './team.controller';
import { TeamService } from '../application/team.service';
import { TeamPrismaRepository } from '../infrastructure/persistence/team.prisma.repository';

// Initialize dependencies
const teamRepository = new TeamPrismaRepository();
const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

// Create router
const teamRouter = Router();

// Define routes
teamRouter.get('/', (req, res) => teamController.getAllTeams(req, res));
teamRouter.get('/filter', (req, res) => teamController.getTeamsByFilters(req, res));
teamRouter.get('/name/:name', (req, res) => teamController.getTeamByName(req, res));
teamRouter.get('/conference/:conference', (req, res) =>
  teamController.getTeamsByConferenceAndDivision(req, res),
);
teamRouter.get('/:id', (req, res) => teamController.getTeamById(req, res));
teamRouter.post('/', (req, res) => teamController.createTeam(req, res));
teamRouter.put('/:id', (req, res) => teamController.updateTeam(req, res));
teamRouter.delete('/:id', (req, res) => teamController.deleteTeam(req, res));

export default teamRouter;
