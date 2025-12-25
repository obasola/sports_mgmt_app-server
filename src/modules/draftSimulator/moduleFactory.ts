// sports_mgmt_app_server/src/modules/draftSimulator/moduleFactory.ts
import type { PrismaClient } from '@prisma/client'
import type { Router } from 'express'
import { buildDraftSimulatorRoutes } from './presentation/http/draftSimulatorRoutes'
import { DraftSimulatorController } from './presentation/http/DraftSimulatorController'

import { PrismaDraftSimulationRepository } from './infrastructure/persistence/prisma/PrismaDraftSimulationRepository'
import { PrismaProspectRepository } from './infrastructure/persistence/prisma/PrismaProspectRepository'
import { PrismaTeamNeedRepository } from './infrastructure/persistence/prisma/PrismaTeamNeedRepository'
import { CpuDraftStrategy } from './infrastructure/services/CpuDraftStrategy'
import { CreateSimulationUseCase } from './application/usecases/CreateSimulationUseCase'
import { GetDraftStateUseCase } from './application/usecases/GetDraftStateUseCase'
import { ListProspectsUseCase } from './application/usecases/ListProspectsUseCase'
import { MakePickUseCase } from './application/usecases/MakePickUseCase'
import { SimulateNextPickUseCase } from './application/usecases/SimulateNextPickUseCase'
import { StartSimulationUseCase } from './application/usecases/StartSimulationUseCase'
import { GetTeamConsoleUseCase } from './application/usecases/GetTeamConsoleUseCase'


export function buildDraftSimulatorModule(prisma: PrismaClient): Router {
  const simRepo = new PrismaDraftSimulationRepository(prisma)
  const prospectRepo = new PrismaProspectRepository(prisma)
  const needRepo = new PrismaTeamNeedRepository(prisma)
  const cpu = new CpuDraftStrategy()
  const teamConsoleUc = new GetTeamConsoleUseCase(simRepo, needRepo)

  const createUc = new CreateSimulationUseCase(simRepo)
  const startUc = new StartSimulationUseCase(simRepo)
  const getUc = new GetDraftStateUseCase(simRepo)
  const listUc = new ListProspectsUseCase(simRepo, prospectRepo)
  const pickUc = new MakePickUseCase(simRepo)
  const simNextUc = new SimulateNextPickUseCase(simRepo, prospectRepo, needRepo, cpu)

  const controller = new DraftSimulatorController(
    createUc, startUc, getUc, listUc, pickUc, simNextUc, teamConsoleUc
  )

  return buildDraftSimulatorRoutes(controller)
}
