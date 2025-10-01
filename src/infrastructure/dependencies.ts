// src/infrastructure/dependencies.ts

import { PrismaClient } from '@prisma/client'

// Existing – Draft domain wiring
import { DraftService } from '../application/draft/service/DraftService'
import { DraftPickRepository } from '../infrastructure/repositories/DraftPickRepository'
import { ProspectRepository } from '../infrastructure/repositories/ProspectRepository'
import { TeamNeedRepository } from '../infrastructure/repositories/TeamNeedRepository'

// Teams & Games repos (Prisma)
import { PrismaTeamRepository as TeamRepository } from '../infrastructure/repositories/PrismaTeamRepository'
import { PrismaGameRepository } from './repositories/PrismaGameRepository'

// ESPN client + Services
import { EspnScoreboardClient } from './scoreboardClient'
import { ImportNflScoresService } from '../services/importNflScores'
import { BackfillSeasonService } from '../services/backfillSeason'   // ✅ added
import { SyncTeamsService } from '../services/syncTeams'             // ✅ added

// Job logger (Prisma impl)
import { PrismaJobLogger } from './repositories/PrismaJobLogger'

// Initialize Prisma client (single shared instance)
const prisma = new PrismaClient()

// ------------------------------------------------------------------
// Repositories
// ------------------------------------------------------------------
const draftPickRepository = new DraftPickRepository(prisma)
const prospectRepository  = new ProspectRepository(prisma)
const teamNeedRepository  = new TeamNeedRepository(prisma)
const teamRepository      = new TeamRepository()
const gameRepository      = new PrismaGameRepository(prisma)

// ------------------------------------------------------------------
// Infra: ESPN client + Job logger
// ------------------------------------------------------------------
const espnClient = new EspnScoreboardClient()
const jobLogger  = new PrismaJobLogger(prisma)

// ------------------------------------------------------------------
// Services
// ------------------------------------------------------------------
const draftService = new DraftService(
  draftPickRepository,
  prospectRepository,
  teamNeedRepository
)

const importWeekService     = new ImportNflScoresService(espnClient, gameRepository, jobLogger)
const backfillSeasonService = new BackfillSeasonService(espnClient, gameRepository, jobLogger)
const syncTeamsService      = new SyncTeamsService(espnClient, teamRepository, jobLogger)

// ------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------
export {
  prisma,

  // Repos
  draftPickRepository,
  prospectRepository,
  teamNeedRepository,
  teamRepository,
  gameRepository,

  // Infra
  espnClient,
  jobLogger,

  // Services
  draftService,
  importWeekService,
  backfillSeasonService,
  syncTeamsService,
}
