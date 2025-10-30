// ==========================
// src/bootstrap/jobModule.ts
// File: src/bootstrap/jobsModule.ts
// ==========================
import { PrismaClient } from '@prisma/client';

// Infra
import { PrismaJobRepository } from '../infrastructure/repositories/PrismaJobRepository';
import { PrismaJobLogRepository } from '../infrastructure/repositories/PrismaJobLogRepository';
import { JobLogEmitter } from '../infrastructure/queue/JobLogEmitter';
import { InProcessJobRunner } from '../infrastructure/queue/InProcessJobRunner';
import { CronScheduler } from '../infrastructure/schedule/CronScheduler';

// App services (note the exact names/paths)
import { QueueJobService } from '../application/jobs/services/QueueJobService';
import { RunJobService } from '../application/jobs/services/RunJobService';
import { CancelJobService } from '../application/jobs/services/CancelJobService';
import { ListJobsService } from '../application/jobs/services/ListJobService';
import { GetJobDetailService } from '../application/jobs/services/GetJobDetailService';
import GetJobLogsService from '../application/jobs/services/GetJobLogService';
import { StreamJobLogsService } from '../application/jobs/services/StreamJobLogService';
import { ScheduleJobService } from '../application/jobs/services/ScheduleJobService';
import { prisma } from '../infrastructure/prisma';
import { importWeekService } from '../infrastructure/dependencies'; // add at top if not present

// Presentation
import { JobController } from '../presentation/controllers/JobController';
import { buildJobRoutes } from '../presentation/routes/jobRoutes';

// Domain
import { JobType } from '../domain/jobs/value-objects/JobType';

export function buildJobsModule() {
  // repos + infra singletons
  const jobRepo = new PrismaJobRepository(prisma);
  const logRepo = new PrismaJobLogRepository(prisma);
  const emitter = new JobLogEmitter();
  const runner = new InProcessJobRunner(); // <- runner needs deps

  // Register job handlers (ALIGN with your enum names + ctx API)
  // If your JobType uses UPPER_CASE members (recommended):
  runner.register(JobType.SYNC_TEAMS, async (payload, ctx) => {
    await ctx.log('info', 'Invoking SyncTeamsService...');
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    // TODO: call your real SyncTeamsService here
    await new Promise((r) => setTimeout(r, 500));
    await ctx.log('info', 'SyncTeams completed');
    return { code: 'ok', data: { synced: true } };
  });

  runner.register(JobType.BACKFILL_SEASON, async (payload, ctx) => {
    const p = (payload ?? {}) as { seasonYear?: number };
    await ctx.log('info', `Backfilling season year=${p.seasonYear ?? 'n/a'}`);
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    // TODO: call your real BackfillSeasonService here
    await new Promise((r) => setTimeout(r, 1000));
    await ctx.log('info', 'BackfillSeason completed');
    return { code: 'ok', data: { year: p.seasonYear, games: 256 } };
  });

  // inside buildJobsModule()

  runner.register(JobType.IMPORT_SCORES_WEEK, async (payload, ctx) => {
    // Defensive parse from payload
    const { year, seasonType, week } = (payload ?? {}) as {
      year?: number;
      seasonType?: 1 | 2 | 3;
      week?: number;
    };

    await ctx.log(
      'info',
      `Starting score import for ${year} seasonType=${seasonType} week=${week}`
    );
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };

    // Run the same logic used in CLI
    const result = await importWeekService.run({
      seasonYear: String(year),
      seasonType: seasonType ?? 2,
      week: week ?? 1,
    });

    if (result.scoreChanges?.length) {
      const summary = result.scoreChanges
        .map((g) => `${g.homeTeam} ${g.homeScore}-${g.awayScore} ${g.awayTeam}`)
        .join('; ');
      await ctx.log('info', `🏈 Score changes: ${summary}`);
    } else {
      await ctx.log('info', 'No score changes detected.');
    }

    await ctx.log(
      'info',
      `✅ Completed import: upserts=${result.upserts}, skipped=${result.skipped}`
    );
    return { code: 'ok', data: result };
  });

  // application services
  const queue = new QueueJobService(jobRepo);
  // Your RunJobService currently wants 4 args -> pass them:
  const run = new RunJobService(jobRepo, logRepo, runner, emitter);
  const cancel = new CancelJobService(jobRepo);
  const list = new ListJobsService(jobRepo);
  const getDetail = new GetJobDetailService(jobRepo);
  const getLogs = new GetJobLogsService(logRepo);
  const stream = new StreamJobLogsService(emitter);
  const scheduler = new ScheduleJobService(new CronScheduler(queue, run));

  // controller + routes
  const ctl = new JobController(queue, run, cancel, list, getDetail, getLogs, scheduler);
  const routes = buildJobRoutes(ctl);

  return { routes, prisma, runner, scheduler };
}
