import type { PrismaClient } from '@prisma/client'
import type { Router } from 'express'

import { DraftOrderController } from './presentation/controllers/DraftOrderController'
import { buildDraftOrderRoutes } from './presentation/routes/draftOrderRoutes'


import { ListDraftOrderSnapshotsUseCaseImpl } from './application/usecases/impl/ListDraftOrderSnapshotsUseCaseImpl'
import { GetDraftOrderSnapshotByIdUseCaseImpl } from './application/usecases/impl/GetDraftOrderSnapshotByIdUseCaseImpl'
import { PrismaDraftOrderSnapshotRepository } from './infrastructure/persistence/prisma/PrismaDraftOrderSnapshotRepository'


export function buildDraftOrderModule(prisma: PrismaClient): Router {
  const repo = new PrismaDraftOrderSnapshotRepository(prisma)

  const listUc = new ListDraftOrderSnapshotsUseCaseImpl(repo)
  const getByIdUc = new GetDraftOrderSnapshotByIdUseCaseImpl(repo)

  const controller = new DraftOrderController(listUc, getByIdUc)
  return buildDraftOrderRoutes(controller)
}
