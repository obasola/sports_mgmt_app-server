import type { Router } from 'express'
import { Router as createRouter } from 'express'
import type { DraftOrderController } from '../controllers/DraftOrderController'

export function buildDraftOrderRoutes(controller: DraftOrderController): Router {
  const router = createRouter()
  router.get('/snapshots', controller.list)
  router.get('/snapshots/:id', controller.getOne)
  return router
}
