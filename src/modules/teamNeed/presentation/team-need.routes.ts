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

/**
 * @swagger
 * tags:
 *   name: TeamNeeds
 *   description: API endpoints for managing team roster needs
 * 
 * /api/team-needs:
 *   get:
 *     summary: Retrieve all team needs
 *     description: Returns a list of all team position needs across all teams
 *     tags: [TeamNeeds]
 *     responses:
 *       200:
 *         description: A list of team needs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamNeed'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   post:
 *     summary: Create a new team need
 *     description: Adds a new position need for a team
 *     tags: [TeamNeeds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - position
 *             properties:
 *               teamId:
 *                 type: integer
 *                 description: ID of the team
 *               position:
 *                 type: string
 *                 description: Position code (e.g., QB, WR, CB)
 *               priority:
 *                 type: integer
 *                 description: Priority level (1 is highest)
 *                 default: 1
 *               draftYear:
 *                 type: string
 *                 format: date
 *                 description: Target draft year for addressing this need
 *             example:
 *               teamId: 1
 *               position: "CB"
 *               priority: 1
 *               draftYear: "2024-04-01"
 *     responses:
 *       201:
 *         description: Team need created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamNeed'
 *       400:
 *         description: Bad request - validation failed or duplicate position
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team already has a need for position: CB"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/{id}:
 *   get:
 *     summary: Get a team need by ID
 *     description: Retrieves detailed information about a specific team need
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team need ID
 *     responses:
 *       200:
 *         description: Team need details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamNeed'
 *       404:
 *         description: Team need not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team need not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   
 *   put:
 *     summary: Update a team need
 *     description: Updates details of an existing team need
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team need ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: integer
 *               position:
 *                 type: string
 *               priority:
 *                 type: integer
 *               draftYear:
 *                 type: string
 *                 format: date
 *             example:
 *               priority: 2
 *               draftYear: "2025-04-01"
 *     responses:
 *       200:
 *         description: Team need updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamNeed'
 *       400:
 *         description: Bad request - validation failed or duplicate position
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
 *     summary: Delete a team need
 *     description: Removes a team need from the system
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team need ID
 *     responses:
 *       200:
 *         description: Team need deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team need deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/team/{teamId}:
 *   get:
 *     summary: Get team needs by team ID
 *     description: Retrieves all position needs for a specific team
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: List of team needs for a specific team
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamNeed'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/position/{position}:
 *   get:
 *     summary: Get team needs by position
 *     description: Finds all teams that need a specific position
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: position
 *         schema:
 *           type: string
 *         required: true
 *         description: The position code (e.g., QB, WR, CB)
 *     responses:
 *       200:
 *         description: Teams needing the specified position
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamNeed'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/priority/{priority}:
 *   get:
 *     summary: Get team needs by priority level
 *     description: Finds team needs with a specific priority level
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: priority
 *         schema:
 *           type: integer
 *         required: true
 *         description: The priority level (1 is highest)
 *     responses:
 *       200:
 *         description: Team needs with the specified priority
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamNeed'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/{id}/increment-priority:
 *   put:
 *     summary: Increment the priority of a team need
 *     description: Increases the priority value (lower priority)
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team need ID
 *     responses:
 *       200:
 *         description: Priority incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamNeed'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/team-needs/{id}/decrement-priority:
 *   put:
 *     summary: Decrement the priority of a team need
 *     description: Decreases the priority value (higher priority), minimum value is 1
 *     tags: [TeamNeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team need ID
 *     responses:
 *       200:
 *         description: Priority decremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamNeed'
 *       400:
 *         description: Bad request - priority already at minimum
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Priority cannot be less than 1"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

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
