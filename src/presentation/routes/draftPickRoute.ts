// src/presentation/routes/draftPickRoutes.ts
import { Router } from 'express';
import { DraftPickController } from '../controllers/DraftPickController';
import { DraftPickService } from '../../application/draftPick/services/DraftPickService';
import { PrismaDraftPickRepository } from '../../infrastructure/repositories/PrismaDraftPickRepository';
import { prisma } from '@/infrastructure/database/prisma';

const draftPickRepository = new PrismaDraftPickRepository(prisma);
const draftPickService = new DraftPickService(draftPickRepository);
const draftPickController = new DraftPickController(draftPickService);

const router = Router();

// Logging middleware
router.use((req, res, next) => {
  console.log(`📡 Draft Pick API: ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/test', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Draft Pick routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ===== SPECIFIC ROUTES FIRST (before dynamic :id routes) =====
router.get('/relations/all', draftPickController.fetchAllWithRelations);
router.get('/relations/year/:year', draftPickController.fetchByYear);
router.get('/relations/team/:teamId/year/:year', draftPickController.fetchByTeamAndYear);

// ===== CRUD endpoints with dynamic IDs LAST =====
router.post('/', draftPickController.create);
router.get('/', draftPickController.findAll);
router.get('/:id', draftPickController.findById);
router.put('/:id', draftPickController.update);
router.delete('/:id', draftPickController.delete);

console.log('✅ Draft Pick routes registered');

export default router;