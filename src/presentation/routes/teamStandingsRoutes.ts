import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { StandingsService } from '@/application/standings/services/StandingsService';
import { StandingsController } from '@/presentation/controllers/StandingsController';

const prisma = new PrismaClient();
const repo = new PrismaStandingsRepository(prisma);
const service = new StandingsService(repo);
const controller = new StandingsController(service);

const router = Router();
router.get('/', controller.get.bind(controller));

export const teamStandingsRoutes = router;
