import { Router } from 'express';
import { prisma } from "@/infrastructure/database/prisma";
import { PrismaStandingsRepository } from '@/infrastructure/repositories/PrismaStandingsRepository';
import { StandingsService } from '@/application/standings/services/StandingsService';
import { StandingsController } from '@/presentation/controllers/StandingsController';


const repo = new PrismaStandingsRepository(prisma);
const service = new StandingsService(repo);
const controller = new StandingsController(service);

const router = Router();
router.get('/standings', controller.get.bind(controller));

export const teamStandingsRoutes = router;
