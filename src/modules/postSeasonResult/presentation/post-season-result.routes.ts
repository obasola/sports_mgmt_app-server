// src/modules/postSeasonResult/presentation/postSeasonResult.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PostSeasonResultService } from '../application/post-season-result.service';
import { PostSeasonResultPrismaRepository } from '../infrastructure/persistence/post-season-result.prisma.repository';
import { PostSeasonResultController } from './post-season-result.controller';
import { validateBody, validateParam } from '../../../shared/infrastructure/middleware/validation';
import { postSeasonResultSchema, postSeasonResultUpdateSchema } from './postSeasonResult.schema';

// Create router instance
export const postSeasonResultRouter = Router();

// Initialize dependencies
const prisma = new PrismaClient();
const postSeasonResultRepository = new PostSeasonResultPrismaRepository(prisma);
const postSeasonResultService = new PostSeasonResultService(postSeasonResultRepository);
const postSeasonResultController = new PostSeasonResultController(postSeasonResultService);

/**
 * @swagger
 * /api/post-season-results:
 *   get:
 *     summary: Retrieve all post-season results
 *     tags: [PostSeasonResults]
 *     responses:
 *       200:
 *         description: A list of post-season results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSeasonResult'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.get('/post-season-results/', (req, res) =>
  postSeasonResultController.getAllPostSeasonResults(req, res),
);

/**
 * @swagger
 * /api/post-season-results/{id}:
 *   get:
 *     summary: Get post-season result by ID
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the post-season result
 *     responses:
 *       200:
 *         description: Post-season result data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostSeasonResult'
 *       404:
 *         description: Post-season result not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.get('/post-season-results/:id', validateParam('id', 'number'), (req, res) =>
  postSeasonResultController.getPostSeasonResultById(req, res),
);

/**
 * @swagger
 * /api/post-season-results/team/{teamId}:
 *   get:
 *     summary: Get post-season results by team ID
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the team
 *     responses:
 *       200:
 *         description: List of post-season results for the team
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSeasonResult'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.get(
  '/post-season-results/team/:teamId',
  validateParam('teamId', 'number'),
  (req, res) => postSeasonResultController.getPostSeasonResultsByTeamId(req, res),
);

/**
 * @swagger
 * /api/post-season-results/year/{year}:
 *   get:
 *     summary: Get post-season results by year
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playoff year
 *     responses:
 *       200:
 *         description: List of post-season results for the year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSeasonResult'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.get(
  '/post-season-results/year/:year',
  validateParam('year', 'number'),
  (req, res) => postSeasonResultController.getPostSeasonResultsByYear(req, res),
);

/**
 * @swagger
 * /api/post-season-results/team/{teamId}/year/{year}:
 *   get:
 *     summary: Get post-season result for a team in a specific year
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the team
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Playoff year
 *     responses:
 *       200:
 *         description: Post-season result data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostSeasonResult'
 *       404:
 *         description: Post-season result not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.get(
  '/post-season-results/team/:teamId/year/:year',
  validateParam('teamId', 'number'),
  validateParam('year', 'number'),
  (req, res) => postSeasonResultController.getPostSeasonResultByTeamAndYear(req, res),
);

/**
 * @swagger
 * /api/post-season-results:
 *   post:
 *     summary: Create a new post-season result
 *     tags: [PostSeasonResults]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playoffYear
 *             properties:
 *               playoffYear:
 *                 type: integer
 *               lastRoundReached:
 *                 type: string
 *               winLose:
 *                 type: string
 *                 enum: [W, L]
 *               opponentScore:
 *                 type: integer
 *               teamScore:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post-season result created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostSeasonResult'
 *       400:
 *         description: Invalid input
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.post(
  '/post-season-results/',
  validateBody(postSeasonResultSchema),
  (req, res) => postSeasonResultController.createPostSeasonResult(req, res),
);

/**
 * @swagger
 * /api/post-season-results/{id}:
 *   put:
 *     summary: Update a post-season result
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the post-season result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playoffYear:
 *                 type: integer
 *               lastRoundReached:
 *                 type: string
 *               winLose:
 *                 type: string
 *                 enum: [W, L]
 *               opponentScore:
 *                 type: integer
 *               teamScore:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Post-season result updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostSeasonResult'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post-season result not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.put(
  '/post-season-results/:id',
  validateParam('id', 'number'),
  validateBody(postSeasonResultUpdateSchema),
  (req, res) => postSeasonResultController.updatePostSeasonResult(req, res),
);

/**
 * @swagger
 * /api/post-season-results/{id}:
 *   delete:
 *     summary: Delete a post-season result
 *     tags: [PostSeasonResults]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the post-season result
 *     responses:
 *       200:
 *         description: Post-season result deleted
 *       404:
 *         description: Post-season result not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.delete('/:id', validateParam('id', 'number'), (req, res) =>
  postSeasonResultController.deletePostSeasonResult(req, res),
);

// Additional route for batch upload of post-season results
/**
 * @swagger
 * /api/post-season-results/batch:
 *   post:
 *     summary: Create multiple post-season results in a batch
 *     tags: [PostSeasonResults]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - playoffYear
 *               properties:
 *                 playoffYear:
 *                   type: integer
 *                 lastRoundReached:
 *                   type: string
 *                 winLose:
 *                   type: string
 *                   enum: [W, L]
 *                 opponentScore:
 *                   type: integer
 *                 teamScore:
 *                   type: integer
 *                 teamId:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Post-season results created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSeasonResult'
 *       400:
 *         description: Invalid input
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postSeasonResultRouter.post('/post-season-results/batch', (req, res) => {
  // Implementation would be added to the controller
  res.status(501).json({ message: 'Not implemented yet' });
});

// Create validation schema file to use with the validation middleware
// src/modules/postSeasonResult/presentation/postSeasonResult.schema.ts
/*
import Joi from 'joi';

export const postSeasonResultSchema = Joi.object({
  playoffYear: Joi.number().integer().required(),
  lastRoundReached: Joi.string().max(45).allow(null),
  winLose: Joi.string().valid('W', 'L').allow(null),
  opponentScore: Joi.number().integer().allow(null),
  teamScore: Joi.number().integer().allow(null),
  teamId: Joi.number().integer().allow(null)
});

export const postSeasonResultUpdateSchema = Joi.object({
  playoffYear: Joi.number().integer(),
  lastRoundReached: Joi.string().max(45).allow(null),
  winLose: Joi.string().valid('W', 'L').allow(null),
  opponentScore: Joi.number().integer().allow(null),
  teamScore: Joi.number().integer().allow(null),
  teamId: Joi.number().integer().allow(null)
}).min(1);
*/

// Create validation middleware in the shared folder
// src/shared/infrastructure/middleware/validation.ts
/*
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(detail => detail.message) 
      });
    }
    
    next();
  };
};

export const validateParam = (paramName: string, type: 'string' | 'number') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const param = req.params[paramName];
    
    if (!param) {
      return res.status(400).json({ 
        message: `Missing required parameter: ${paramName}`
      });
    }
    
    if (type === 'number') {
      const numValue = Number(param);
      if (isNaN(numValue)) {
        return res.status(400).json({ 
          message: `Parameter ${paramName} must be a number`
        });
      }
      // Convert string param to number in req.params
      req.params[paramName] = numValue as any;
    }
    
    next();
  };
};
*/
