// src/modules/schedule/presentation/schedule.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from '../application/schedule.service';
import { SchedulePrismaRepository } from '../infrastructure/persistence/schedule.prisma.repository';

export const scheduleRouter = Router();
const prisma = new PrismaClient();
const scheduleRepository = new SchedulePrismaRepository(prisma);
const scheduleService = new ScheduleService(scheduleRepository);
const scheduleController = new ScheduleController(scheduleService);

// Routes
scheduleRouter.get('/', (req, res) => scheduleController.getAllSchedules(req, res));
scheduleRouter.get('/:id', (req, res) => scheduleController.getScheduleById(req, res));
scheduleRouter.get('/team/:teamId', (req, res) =>
  scheduleController.getSchedulesByTeamId(req, res),
);
scheduleRouter.get('/team/:teamId/season/:seasonYear', (req, res) =>
  scheduleController.getSchedulesByTeamAndSeason(req, res),
);
scheduleRouter.get('/season/:seasonYear/week/:week', (req, res) =>
  scheduleController.getSchedulesByWeek(req, res),
);
scheduleRouter.get('/date/:date', (req, res) => scheduleController.getSchedulesByDate(req, res));
scheduleRouter.get('/team/:teamId/record/:seasonYear', (req, res) =>
  scheduleController.getTeamRecord(req, res),
);
scheduleRouter.post('/', (req, res) => scheduleController.createSchedule(req, res));
scheduleRouter.put('/:id', (req, res) => scheduleController.updateSchedule(req, res));
scheduleRouter.delete('/:id', (req, res) => scheduleController.deleteSchedule(req, res));
