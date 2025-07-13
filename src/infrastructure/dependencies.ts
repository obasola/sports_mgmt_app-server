// src/infrastructure/dependencies.ts

import { PrismaClient } from '@prisma/client'
import { DraftService } from '../application/draft/service/DraftService'
import { DraftPickRepository } from '../infrastructure/repositories/DraftPickRepository'
import { ProspectRepository } from '../infrastructure/repositories/ProspectRepository'
import { TeamNeedRepository } from '../infrastructure/repositories/TeamNeedRepository'
import { PrismaTeamRepository as TeamRepository} from '../infrastructure/repositories/PrismaTeamRepository'

// Initialize Prisma client
const prisma = new PrismaClient()

// Repository instances
const draftPickRepository = new DraftPickRepository(prisma)
const prospectRepository = new ProspectRepository(prisma)
const teamNeedRepository = new TeamNeedRepository(prisma)
const teamRepository = new TeamRepository()

// Service instances
const draftService = new DraftService(
  draftPickRepository,
  prospectRepository,
  teamNeedRepository
)

// Export all dependencies
export {
  prisma,
  draftPickRepository,
  prospectRepository,
  teamNeedRepository,
  teamRepository,
  draftService
}
