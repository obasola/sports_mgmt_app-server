// src/modules/postSeasonResult/presentation/postSeasonResult.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PostSeasonResultController } from './post-season-result.controller';
import { PostSeasonResultService } from '../application/post-season-result.service';
import { PostSeasonResultPrismaRepository } from '../infrastructure/persistence/post-season-result.prisma.repository';

export const postSeasonResultRouter = Router();
const prisma = new PrismaClient();
const postSeasonResultRepository = new PostSeasonResultPrismaRepository(prisma);
const postSeasonResultService = new PostSeasonResultService(postSeasonResultRepository);
const postSeasonResultController = new PostSeasonResultController(postSeasonResultService);

// Routes
postSeasonResultRouter.get('/', (req, res) =>
  postSeasonResultController.getAllPostSeasonResults(req, res),
);
postSeasonResultRouter.get('/:id', (req, res) =>
  postSeasonResultController.getPostSeasonResultById(req, res),
);
postSeasonResultRouter.get('/team/:teamId', (req, res) =>
  postSeasonResultController.getPostSeasonResultsByTeamId(req, res),
);
postSeasonResultRouter.get('/year/:year', (req, res) =>
  postSeasonResultController.getPostSeasonResultsByYear(req, res),
);
postSeasonResultRouter.get('/team/:teamId/year/:year', (req, res) =>
  postSeasonResultController.getPostSeasonResultByTeamAndYear(req, res),
);
postSeasonResultRouter.post('/', (req, res) =>
  postSeasonResultController.createPostSeasonResult(req, res),
);
postSeasonResultRouter.put('/:id', (req, res) =>
  postSeasonResultController.updatePostSeasonResult(req, res),
);
postSeasonResultRouter.delete('/:id', (req, res) =>
  postSeasonResultController.deletePostSeasonResult(req, res),
);
