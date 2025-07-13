// src/presentation/routes/draftRoutes.ts
 
import { Router } from 'express'
import { DraftController } from '../controllers/DraftController'
import { draftService } from '../../infrastructure/dependencies'

const router = Router()
const draftController = new DraftController(draftService)

router.get('/:year/order', draftController.getDraftOrder.bind(draftController))
router.post('/pick', draftController.makePick.bind(draftController))
router.get('/:pickId/ai-pick', draftController.getAIPick.bind(draftController))

export { router as draftRoutes }
