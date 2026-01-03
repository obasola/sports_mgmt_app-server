import type { Request, Response } from 'express'
import type { z } from 'zod'

import type { ListDraftOrderSnapshotsUseCase } from '../../application/usecases/ListDraftOrderSnapshotsUseCase'
import type { GetDraftOrderSnapshotByIdUseCase } from '../../application/usecases/GetDraftOrderSnapshotByIdUseCase'
import type { ComputeCurrentDraftOrderUseCase } from '../../application/usecases/ComputeCurrentDraftOrderUseCase'
import type { ListDraftOrderSnapshotsQueryDto } from '../../application/dtos/ListDraftOrderSnapshotsQueryDto'

type ListParsed = z.infer<
  z.ZodObject<{
    mode: z.ZodOptional<z.ZodEnum<['current', 'projection']>>
    strategy: z.ZodOptional<z.ZodString>
    seasonYear: z.ZodOptional<z.ZodString>
    seasonType: z.ZodOptional<z.ZodNumber>
    throughWeek: z.ZodOptional<z.ZodNumber>
    page: z.ZodDefault<z.ZodNumber>
    pageSize: z.ZodDefault<z.ZodNumber>
  }>
>

type IdParsed = { readonly id: number }

type ComputeParsed = {
  readonly seasonYear: string
  readonly seasonType: number
  readonly throughWeek?: number
}

export class DraftOrderController {
  public constructor(
    private readonly listUc: ListDraftOrderSnapshotsUseCase,
    private readonly getByIdUc: GetDraftOrderSnapshotByIdUseCase,
    private readonly computeCurrentUc: ComputeCurrentDraftOrderUseCase
  ) {}

  public list =
    (parsed: ListParsed) =>
    async (_req: Request, res: Response): Promise<void> => {
      const query: ListDraftOrderSnapshotsQueryDto = {
        mode: parsed.mode,
        strategy: parsed.strategy,
        seasonYear: parsed.seasonYear,
        seasonType: parsed.seasonType,
        throughWeek: parsed.throughWeek,
        page: parsed.page,
        pageSize: parsed.pageSize,
      }

      const result = await this.listUc.execute(query)
      res.json(result)
    }

  public getOne =
    (parsed: IdParsed) =>
    async (_req: Request, res: Response): Promise<void> => {
      const snapshot = await this.getByIdUc.execute(parsed.id)
      if (!snapshot) {
        res.status(404).json({ error: 'snapshot not found' })
        return
      }
      res.json(snapshot)
    }

  public computeCurrent =
    (parsed: ComputeParsed) =>
    async (_req: Request, res: Response): Promise<void> => {
      const dto = await this.computeCurrentUc.execute({
        seasonYear: parsed.seasonYear,
        seasonType: parsed.seasonType,
        throughWeek: typeof parsed.throughWeek === 'number' ? parsed.throughWeek : null,
      })

      res.status(201).json(dto)
    }
}
