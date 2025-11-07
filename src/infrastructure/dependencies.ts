// ==========================
// File: src/infrastructure/dependencies.ts
// ==========================
import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

// ───────────────────────────────────────────────────────────────
// Repositories – Domain + Job
// ───────────────────────────────────────────────────────────────
import { ProspectRepository } from './repositories/ProspectRepository'
import { TeamNeedRepository } from './repositories/TeamNeedRepository'
import { PrismaTeamRepository } from './repositories/PrismaTeamRepository'
import { PrismaGameRepository } from './repositories/PrismaGameRepository'

// Job Repositories
import { PrismaJobRepository } from './repositories/PrismaJobRepository'
import { PrismaJobLogRepository } from './repositories/PrismaJobLogRepository'

// ───────────────────────────────────────────────────────────────
// Infrastructure (Clients, Queue, Scheduler, Logger)
// ───────────────────────────────────────────────────────────────
import { EspnScoreboardClient } from './scoreboardClient'
import { InProcessJobRunner } from './queue/InProcessJobRunner'
import { JobLogEmitter } from './queue/JobLogEmitter'
import { CronScheduler } from './schedule/CronScheduler'
import { PrismaJobLogger } from './repositories/PrismaJobLogger'

// ───────────────────────────────────────────────────────────────
// Application Services – Core Domain
// ───────────────────────────────────────────────────────────────
import { DraftService } from '../application/draft/service/DraftService'
import { ImportNflScoresService } from '../services/importNflScores'
import { BackfillSeasonService } from '../services/backfillSeason'
import { SyncTeamsService } from '../services/syncTeams'

// ───────────────────────────────────────────────────────────────
// Application Services – Job Management
// ───────────────────────────────────────────────────────────────
import { QueueJobService } from '../application/jobs/services/QueueJobService'
import { RunJobService } from '../application/jobs/services/RunJobService'
import { CancelJobService } from '../application/jobs/services/CancelJobService'
import { ListJobsService } from '../application/jobs/services/ListJobService'
import { GetJobDetailService } from '../application/jobs/services/GetJobDetailService'
import GetJobLogsService from '../application/jobs/services/GetJobLogService'
import { ScheduleJobService } from '../application/jobs/services/ScheduleJobService'

// ───────────────────────────────────────────────────────────────
// 1️⃣ Instantiate Core Infrastructure
// ───────────────────────────────────────────────────────────────
const prismaClient = prisma ?? new PrismaClient()
const espnClient = new EspnScoreboardClient()
const jobEmitter = new JobLogEmitter()

const inProcessRunner = new InProcessJobRunner()
const jobLogger = new PrismaJobLogger(prismaClient)

// ───────────────────────────────────────────────────────────────
// 2️⃣ Instantiate Repositories
// ───────────────────────────────────────────────────────────────
const prospectRepository = new ProspectRepository(prismaClient)
const teamNeedRepository = new TeamNeedRepository(prismaClient)
const teamRepository = new PrismaTeamRepository()
const gameRepository = new PrismaGameRepository(prismaClient)
const jobRepository = new PrismaJobRepository(prismaClient)
const jobLogRepository = new PrismaJobLogRepository(prismaClient)

// ───────────────────────────────────────────────────────────────
// 3️⃣ Instantiate Domain Services
// ───────────────────────────────────────────────────────────────
const draftService = new DraftService(prospectRepository, teamNeedRepository)
const importWeekService = new ImportNflScoresService(espnClient, gameRepository, jobLogger)
const backfillSeasonService = new BackfillSeasonService(espnClient, gameRepository, jobLogger)
const syncTeamsService = new SyncTeamsService(jobLogger)

// ───────────────────────────────────────────────────────────────
// 4️⃣ Instantiate Job Application Services
// ───────────────────────────────────────────────────────────────
const queueJobService = new QueueJobService(jobRepository)
const runJobService = new RunJobService(jobRepository, jobLogRepository, inProcessRunner, jobEmitter)
const cancelJobService = new CancelJobService(jobRepository)
const listJobsService = new ListJobsService(jobRepository)
const getJobDetailService = new GetJobDetailService(jobRepository)
const getJobLogsService = new GetJobLogsService(jobLogRepository)
//
const cronScheduler = new CronScheduler(queueJobService, runJobService)
const scheduleJobService = new ScheduleJobService(cronScheduler)
// ───────────────────────────────────────────────────────────────
// 5️⃣ Export Everything (for Controllers and Routes)
// ───────────────────────────────────────────────────────────────
export {
  // Prisma
  prismaClient as prisma,

  // Repositories
  prospectRepository,
  teamNeedRepository,
  teamRepository,
  gameRepository,
  jobRepository,
  jobLogRepository,

  // Infrastructure
  espnClient,
  jobLogger,
  jobEmitter,
  inProcessRunner,
  cronScheduler,

  // Domain Services
  draftService,
  importWeekService,
  backfillSeasonService,
  syncTeamsService,

  // Job Services
  queueJobService,
  runJobService,
  cancelJobService,
  listJobsService,
  getJobDetailService,
  getJobLogsService,
  scheduleJobService,
}
