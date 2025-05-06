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
/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API endpoints for managing game schedules
 * 
 * /api/schedules:
 *   get:
 *     summary: Retrieve all schedules
 *     description: Returns a list of all scheduled games across all teams and seasons
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: A list of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Create a new schedule entry
 *     description: Adds a new game to the schedule
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seasonYear
 *               - oppTeamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 nullable: true
 *               seasonYear:
 *                 type: string
 *                 description: Season year (e.g., "2023")
 *               oppTeamId:
 *                 type: integer
 *                 description: ID of the opposing team
 *               oppTeamConference:
 *                 type: string
 *                 nullable: true
 *               oppTeamDivision:
 *                 type: string
 *                 nullable: true
 *               scheduleWeek:
 *                 type: integer
 *                 nullable: true
 *               gameDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               gameCity:
 *                 type: string
 *                 nullable: true
 *               gameStateProvince:
 *                 type: string
 *                 nullable: true
 *               gameCountry:
 *                 type: string
 *                 nullable: true
 *               gameLocation:
 *                 type: string
 *                 nullable: true
 *               wonLostFlag:
 *                 type: string
 *                 enum: [W, L]
 *                 nullable: true
 *               homeOrAway:
 *                 type: string
 *                 enum: [H, A]
 *                 nullable: true
 *               oppTeamScore:
 *                 type: integer
 *                 nullable: true
 *               teamScore:
 *                 type: integer
 *                 nullable: true
 *             example:
 *               teamId: 1
 *               seasonYear: "2023"
 *               oppTeamId: 2
 *               scheduleWeek: 1
 *               gameDate: "2023-09-07"
 *               homeOrAway: "H"
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     description: Retrieves detailed information about a specific scheduled game
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: Schedule details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   put:
 *     summary: Update a schedule
 *     description: Updates details of an existing scheduled game
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: integer
 *               seasonYear:
 *                 type: string
 *               oppTeamId:
 *                 type: integer
 *               scheduleWeek:
 *                 type: integer
 *               gameDate:
 *                 type: string
 *                 format: date
 *               homeOrAway:
 *                 type: string
 *                 enum: [H, A]
 *               gameLocation:
 *                 type: string
 *               teamScore:
 *                 type: integer
 *               oppTeamScore:
 *                 type: integer
 *               wonLostFlag:
 *                 type: string
 *                 enum: [W, L]
 *             example:
 *               teamScore: 27
 *               oppTeamScore: 24
 *               wonLostFlag: "W"
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete a schedule
 *     description: Removes a scheduled game from the system
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedule deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/team/{teamId}:
 *   get:
 *     summary: Get schedules by team ID
 *     description: Retrieves all scheduled games for a specific team
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: List of schedules for the team
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/team/{teamId}/season/{seasonYear}:
 *   get:
 *     summary: Get schedules for a team by season
 *     description: Retrieves all scheduled games for a specific team in a specific season
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *       - in: path
 *         name: seasonYear
 *         schema:
 *           type: string
 *         required: true
 *         description: The season year (e.g., "2023")
 *     responses:
 *       200:
 *         description: List of schedules for the team in that season
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/season/{seasonYear}/week/{week}:
 *   get:
 *     summary: Get schedules for a specific week in a season
 *     description: Retrieves all games scheduled for a particular week in a season
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: seasonYear
 *         schema:
 *           type: string
 *         required: true
 *         description: The season year (e.g., "2023")
 *       - in: path
 *         name: week
 *         schema:
 *           type: integer
 *         required: true
 *         description: The week number
 *     responses:
 *       200:
 *         description: List of schedules for that week
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/date/{date}:
 *   get:
 *     summary: Get schedules for a specific date
 *     description: Retrieves all games scheduled for a particular date
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The date in ISO format (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of schedules for that date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/schedules/team/{teamId}/record/{seasonYear}:
 *   get:
 *     summary: Get a team's win-loss record for a season
 *     description: Calculates and returns the team's wins and losses for the specified season
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *       - in: path
 *         name: seasonYear
 *         schema:
 *           type: string
 *         required: true
 *         description: The season year (e.g., "2023")
 *     responses:
 *       200:
 *         description: Team's win-loss record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamRecord'
 *       404:
 *         description: No schedule data found for this team and season
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No schedule data found for team ID 1 in season 2023"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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
