import type { Request, Response } from 'express'
import { z } from 'zod'
import type { ListDraftOrderSnapshotsUseCase } from '../../application/usecases/ListDraftOrderSnapshotsUseCase'
import type { GetDraftOrderSnapshotByIdUseCase } from '../../application/usecases/GetDraftOrderSnapshotByIdUseCase'
import type { ListDraftOrderSnapshotsQueryDto } from '../../application/dtos/ListDraftOrderSnapshotsQueryDto'

const ListQuerySchema = z
  .object({
    mode: z.enum(['current', 'projection']).optional(),
    strategy: z.string().min(1).optional(),
    seasonYear: z.string().regex(/^\d{4}$/).optional(),
    seasonType: z.coerce.number().int().min(1).max(3).optional(),
    throughWeek: z.coerce.number().int().min(0).max(25).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .passthrough()

const IdSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export class DraftOrderController {
  constructor(
    private readonly listSnapshots: ListDraftOrderSnapshotsUseCase,
    private readonly getById: GetDraftOrderSnapshotByIdUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const parsed = ListQuerySchema.parse(req.query)

    const query: ListDraftOrderSnapshotsQueryDto = {
      mode: parsed.mode,
      strategy: parsed.strategy,
      seasonYear: parsed.seasonYear,
      seasonType: parsed.seasonType,
      throughWeek: parsed.throughWeek,
      page: parsed.page,
      pageSize: parsed.pageSize,
    }

    const result = await this.listSnapshots.execute(query)
    res.json(result)
  }

  getOne = async (req: Request, res: Response): Promise<void> => {
    const { id } = IdSchema.parse(req.params)

    const snapshot = await this.getById.execute(id)
    if (!snapshot) {
      res.status(404).json({ error: 'snapshot not found' })
      return
    }

    res.json(snapshot)
  }
}
