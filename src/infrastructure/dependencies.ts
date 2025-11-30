// ==========================
// File: src/infrastructure/dependencies.ts
// ==========================
import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'
// ───────────────────────────────────────────────────────────────
// Repositories – Email + Authentication
// ───────────────────────────────────────────────────────────────
import { Argon2PasswordHasher } from "./security/Argon2PasswordHasher";
import { NodeCryptoSecureTokenGenerator } from "./security/NodeCryptoSecureTokenGenerator";
import { JwtAuthTokenService } from "./jwt/JwtAuthTokenService";
import { createMailService } from "./mail/MailServiceFactory";

import { RegisterUseCase } from "@/application/auth/register/RegisterUseCase";
import { VerifyEmailUseCase } from "@/application/auth/verify-email/VerifyEmailUseCase";
import { LoginUseCase } from "@/application/auth/login/LoginUseCase";
import { RefreshTokenUseCase } from "@/application/auth/refresh/RefreshTokenUseCase";
import { LogoutUseCase } from "@/application/auth/logout/LogoutUseCase";
import { ForgotPasswordUseCase } from "@/application/auth/forgot-password/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "@/application/auth/reset-password/ResetPasswordUseCase";

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

import { BackfillSeasonService } from '../services/backfillSeason'
import { SyncTeamsService } from '../services/syncTeams'

// ───────────────────────────────────────────────────────────────
// src/infrastructure/repositories/dependencies.ts
// Application Services – Job Management
// ───────────────────────────────────────────────────────────────
import { QueueJobService } from '../application/jobs/services/QueueJobService'
import { RunJobService } from '../application/jobs/services/RunJobService'
import { CancelJobService } from '../application/jobs/services/CancelJobService'
import { ListJobsService } from '../application/jobs/services/ListJobService'
import { GetJobDetailService } from '../application/jobs/services/GetJobDetailService'
import GetJobLogsService from '../application/jobs/services/GetJobLogService'
import { ScheduleJobService } from '../application/jobs/services/ScheduleJobService'
import { ImportScoresByDateService } from '@/application/scoreboard/services/ImportScoresByDateService'
import { ScoreboardSyncService } from '@/application/scoreboard/services/ScoreboardSyncService'
import { SyncWeekEventsService } from '@/application/schedule/services/SyncWeekEventsService';
import { PrismaPersonRepository } from './repositories/PrismaPersonRepository';

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
const backfillSeasonService = new BackfillSeasonService(espnClient, gameRepository, jobLogger)
const syncTeamsService = new SyncTeamsService(jobLogger)
const syncWeekEventsService = new SyncWeekEventsService(gameRepository, teamRepository);
const scoreboardSyncService = new ScoreboardSyncService();

// ───────────────────────────────────────────────────────────────
// 4️⃣ Instantiate Job Application Services
// ───────────────────────────────────────────────────────────────
const queueJobService     = new QueueJobService(jobRepository)
const runJobService       = new RunJobService(jobRepository, jobLogRepository, inProcessRunner, jobEmitter)
const cancelJobService    = new CancelJobService(jobRepository)
const listJobsService     = new ListJobsService(jobRepository)
const getJobDetailService = new GetJobDetailService(jobRepository)
const getJobLogsService   = new GetJobLogsService(jobLogRepository)
const getScoresByDateService = new ImportScoresByDateService(new ScoreboardSyncService() );

//
const cronScheduler       = new CronScheduler(queueJobService, runJobService)
const scheduleJobService  = new ScheduleJobService(cronScheduler)
//
// ───────────────────────────────────────────────────────────────
// 5️⃣ Authentication Infrastructure & Use Cases
// ───────────────────────────────────────────────────────────────
export const personRepo = new PrismaPersonRepository();
export const passwordHasher = new Argon2PasswordHasher();
export const tokenGen = new NodeCryptoSecureTokenGenerator();
export const jwtTokens = new JwtAuthTokenService();

// 🔥 Now using your DI-aware provider selector (resend/sendgrid/mailersend)
export const mailer = createMailService();

export const registerUseCase = new RegisterUseCase(
  personRepo, passwordHasher, tokenGen, mailer
);

export const resetPasswordUseCase = new ResetPasswordUseCase(
  personRepo, passwordHasher
);

export const verifyEmailUseCase = new VerifyEmailUseCase(personRepo);

export const loginUseCase = new LoginUseCase(
  personRepo, passwordHasher, jwtTokens
);

export const refreshTokenUseCase = new RefreshTokenUseCase(
  personRepo, passwordHasher, jwtTokens
);

export const logoutUseCase = new LogoutUseCase(
  personRepo, passwordHasher
);

export const forgotPasswordUseCase = new ForgotPasswordUseCase(
  personRepo, tokenGen, mailer
);

// ───────────────────────────────────────────────────────────────
// 6️⃣ Export Everything
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
  backfillSeasonService,
  syncTeamsService,
  syncWeekEventsService,
  scoreboardSyncService,

  // Job Services
  queueJobService,
  runJobService,
  cancelJobService,
  listJobsService,
  getJobDetailService,
  getJobLogsService,
  getScoresByDateService,
  scheduleJobService,
};