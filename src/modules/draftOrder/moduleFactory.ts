import type { PrismaClient } from '@prisma/client'
import type { Router } from 'express'

import type { DraftOrderSnapshotRepository } from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'
import type { GameFactsRepository } from '@/modules/draftOrder/domain/repositories/GameFactsRepository'

import { PrismaDraftOrderSnapshotRepository } from '@/modules/draftOrder/infrastructure/persistence/prisma/PrismaDraftOrderSnapshotRepository'
import { PrismaGameFactsRepository } from '@/modules/draftOrder/infrastructure/persistence/prisma/PrismaGameFactsRepository'

import { ComputeCurrentDraftOrderService } from '@/modules/draftOrder/application/services/ComputeCurrentDraftOrderService'
import { ComputeCurrentDraftOrderUseCaseImpl } from '@/modules/draftOrder/application/usecases/impl/ComputeCurrentDraftOrderUseCaseImpl'

import { ListDraftOrderSnapshotsUseCaseImpl } from '@/modules/draftOrder/application/usecases/impl/ListDraftOrderSnapshotsUseCaseImpl'
import { GetDraftOrderSnapshotByIdUseCaseImpl } from '@/modules/draftOrder/application/usecases/impl/GetDraftOrderSnapshotByIdUseCaseImpl'

import { DraftOrderController } from '@/modules/draftOrder/presentation/controllers/DraftOrderController'
import { buildDraftOrderRoutes } from '@/modules/draftOrder/presentation/routes/draftOrderRoutes'

export function buildDraftOrderModule(prisma: PrismaClient): Router {
  const snapshotRepo: DraftOrderSnapshotRepository = new PrismaDraftOrderSnapshotRepository(prisma)
  const gamesRepo: GameFactsRepository = new PrismaGameFactsRepository(prisma)

  const listUc = new ListDraftOrderSnapshotsUseCaseImpl(snapshotRepo)
  const getByIdUc = new GetDraftOrderSnapshotByIdUseCaseImpl(snapshotRepo)

  const computeSvc = new ComputeCurrentDraftOrderService()
  const computeCurrentUc = new ComputeCurrentDraftOrderUseCaseImpl(gamesRepo, snapshotRepo, computeSvc)

  const controller = new DraftOrderController(listUc, getByIdUc, computeCurrentUc)
  return buildDraftOrderRoutes(controller)
}
