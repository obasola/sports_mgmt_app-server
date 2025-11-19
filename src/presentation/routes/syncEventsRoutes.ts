// src/presentation/routes/syncEventsRoutes.ts

import { Router } from 'express'
import { SyncEventsController } from '../controllers/SyncEventsController'

const router = Router()
const controller = new SyncEventsController()

router.post('/events/kickoff-week', controller.kickoffWeekly)
router.post('/events/run-week', controller.runNow)

export default router
