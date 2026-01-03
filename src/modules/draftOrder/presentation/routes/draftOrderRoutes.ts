import { Router } from 'express'
import { z } from 'zod'
import type { DraftOrderController } from '../controllers/DraftOrderController'

const ListQuerySchema = z
  .object({
    mode: z.enum(['current', 'projection']).optional(),
    strategy: z.string().min(1).optional(),
    seasonYear: z
      .string()
      .regex(/^\d{4}$/)
      .optional(),
    seasonType: z.coerce.number().int().min(1).max(3).optional(),
    throughWeek: z.coerce.number().int().min(0).max(25).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .passthrough()

const IdSchema = z.object({ id: z.coerce.number().int().min(1) })

const ComputeQuerySchema = z
  .object({
    seasonYear: z.string().regex(/^\d{4}$/),
    seasonType: z.coerce.number().int().min(1).max(3).default(2),
    throughWeek: z.coerce.number().int().min(0).max(25).optional(),
  })
  .passthrough()

const ComputeProjectionQuerySchema = z
  .object({
    seasonYear: z.string().regex(/^\d{4}$/),
    seasonType: z.coerce.number().int().min(1).max(3).default(2),
    throughWeek: z.coerce.number().int().min(0).max(25).optional(),
    strategy: z.string().min(1).max(64).optional(),
  })
  .passthrough()

export function buildDraftOrderRoutes(controller: DraftOrderController): Router {
  const router = Router()

  router.get('/snapshots', (req, res) => {
    const parsed = ListQuerySchema.parse(req.query)
    return controller.list(parsed)(req, res)
  })

  router.get('/snapshots/:id', (req, res) => {
    const parsed = IdSchema.parse(req.params)
    return controller.getOne(parsed)(req, res)
  })

  router.post('/compute/current', (req, res) => {
    const parsed = ComputeQuerySchema.parse(req.query)
    return controller.computeCurrent(parsed)(req, res)
  })

  router.post('/compute/projection', (req, res) => {
    const parsed = ComputeProjectionQuerySchema.parse(req.query)
    return controller.computeProjection(parsed)(req, res)
  })

  return router
}
