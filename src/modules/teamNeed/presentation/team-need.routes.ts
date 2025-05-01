// src/modules/teamNeed/presentation/teamNeed.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TeamNeedService } from '../application/team-need.service';
import { TeamNeedPrismaRepository } from '../infrastructure/persistence/team-need.prisma.repository';
import { TeamNeedController } from './team-need.controller';

export const teamNeedRouter = Router();
const prisma = new PrismaClient();
const teamNeedRepository = new TeamNeedPrismaRepository(prisma);
const teamNeedService = new TeamNeedService(teamNeedRepository);
const teamNeedController = new TeamNeedController(teamNeedService);

// Routes
teamNeedRouter.get('/', (req, res) => teamNeedController.getAllTeamNeeds(req, res));
teamNeedRouter.get('/:id', (req, res) => teamNeedController.getTeamNeedById(req, res));
teamNeedRouter.get('/team/:teamId', (req, res) =>
  teamNeedController.getTeamNeedsByTeamId(req, res),
);
teamNeedRouter.post('/', (req, res) => teamNeedController.createTeamNeed(req, res));
teamNeedRouter.put('/:id', (req, res) => teamNeedController.updateTeamNeed(req, res));
teamNeedRouter.delete('/:id', (req, res) => teamNeedController.deleteTeamNeed(req, res));
teamNeedRouter.put('/:id/increment-priority', (req, res) =>
  teamNeedController.incrementPriority(req, res),
);
teamNeedRouter.put('/:id/decrement-priority', (req, res) =>
  teamNeedController.decrementPriority(req, res),
);
