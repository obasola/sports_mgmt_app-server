// src/presentation/routes/prospectRoutes.ts
import { Router } from 'express';
import { ProspectController } from '../controllers/ProspectController';
import { ProspectService } from '@/application/prospect/services/ProspectService';
import { PrismaProspectRepository } from '@/infrastructure/repositories/PrismaProspectRepository';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CreateProspectDtoSchema,
  UpdateProspectDtoSchema,
  ProspectFiltersDtoSchema,
  PaginationDtoSchema,
  UpdatePersonalInfoDtoSchema,
  UpdateCombineScoresDtoSchema,
  MarkAsDraftedDtoSchema,
  CombineScoreFilterDtoSchema,
} from '@/application/prospect/dto/ProspectDto';
import { z } from 'zod';

const router = Router();

// Dependency injection
const prospectRepository = new PrismaProspectRepository();
const prospectService = new ProspectService(prospectRepository);
const prospectController = new ProspectController(prospectService);

// Parameter validation schemas
const IdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const PositionParamsSchema = z.object({
  position: z.string().min(1, 'Position is required').max(10, 'Position cannot exceed 10 characters'),
});

const CollegeParamsSchema = z.object({
  college: z.string().min(1, 'College name is required'),
});

const TeamIdParamsSchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'Team ID must be a number').transform(Number),
});

// Query validation schemas
const QuerySchema = ProspectFiltersDtoSchema.merge(PaginationDtoSchema);
const CombineQuerySchema = CombineScoreFilterDtoSchema.merge(PaginationDtoSchema);
const PaginationQuerySchema = PaginationDtoSchema;

const TopAthletesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
});

const DraftedQuerySchema = PaginationDtoSchema.extend({
  draftYear: z.string().regex(/^\d+$/, 'Draft year must be a number').transform(Number).optional(),
});

// Basic CRUD routes
router.post(
  '/',
  validateBody(CreateProspectDtoSchema),
  prospectController.createProspect
);

router.get(
  '/',
  validateQuery(QuerySchema),
  prospectController.getAllProspects
);

router.get(
  '/:id',
  validateParams(IdParamsSchema),
  prospectController.getProspectById
);

router.put(
  '/:id',
  validateParams(IdParamsSchema),
  validateBody(UpdateProspectDtoSchema),
  prospectController.updateProspect
);

router.delete(
  '/:id',
  validateParams(IdParamsSchema),
  prospectController.deleteProspect
);

// Specialized query routes
router.get(
  '/position/:position',
  validateParams(PositionParamsSchema),
  validateQuery(PaginationQuerySchema),
  prospectController.getProspectsByPosition
);

router.get(
  '/college/:college',
  validateParams(CollegeParamsSchema),
  validateQuery(PaginationQuerySchema),
  prospectController.getProspectsByCollege
);

router.get(
  '/status/undrafted',
  validateQuery(PaginationQuerySchema),
  prospectController.getUndraftedProspects
);

router.get(
  '/status/drafted',
  validateQuery(DraftedQuerySchema),
  prospectController.getDraftedProspects
);

router.get(
  '/team/:teamId',
  validateParams(TeamIdParamsSchema),
  validateQuery(PaginationQuerySchema),
  prospectController.getProspectsByTeam
);

// Analytics routes
router.get(
  '/analytics/stats',
  prospectController.getProspectStats
);

router.get(
  '/analytics/top-athletes',
  validateQuery(TopAthletesQuerySchema),
  prospectController.getTopAthletes
);

router.get(
  '/analytics/duplicates',
  prospectController.findDuplicateProspects
);

router.get(
  '/search/combine-scores',
  validateQuery(CombineQuerySchema),
  prospectController.getProspectsByCombineScore
);

// Specialized update routes
router.patch(
  '/:id/personal-info',
  validateParams(IdParamsSchema),
  validateBody(UpdatePersonalInfoDtoSchema),
  prospectController.updatePersonalInfo
);

router.patch(
  '/:id/combine-scores',
  validateParams(IdParamsSchema),
  validateBody(UpdateCombineScoresDtoSchema),
  prospectController.updateCombineScores
);

router.patch(
  '/:id/draft-status/drafted',
  validateParams(IdParamsSchema),
  validateBody(MarkAsDraftedDtoSchema),
  prospectController.markAsDrafted
);

router.patch(
  '/:id/draft-status/undrafted',
  validateParams(IdParamsSchema),
  prospectController.markAsUndrafted
);

export { router as prospectRoutes };