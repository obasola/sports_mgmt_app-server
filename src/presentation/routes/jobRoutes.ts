// ================================================================
// src/presentation/routes/jobRoutes.ts
// Unified Job + Scoreboard Routes
// ================================================================
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// ── Infrastructure ──────────────────────────────────────────────
import { prisma } from '@/infrastructure/prisma';
import { PrismaJobRepository } from '@/infrastructure/repositories/PrismaJobRepository';
import { PrismaJobLogRepository } from '@/infrastructure/repositories/PrismaJobLogRepository';
import { JobLogEmitter } from '@/infrastructure/queue/JobLogEmitter';
import { InProcessJobRunner } from '@/infrastructure/queue/InProcessJobRunner';
import { CronScheduler } from '@/infrastructure/schedule/CronScheduler';

// ── Application Services ────────────────────────────────────────
import { QueueJobService } from '@/application/jobs/services/QueueJobService';
import { RunJobService } from '@/application/jobs/services/RunJobService';
import { CancelJobService } from '@/application/jobs/services/CancelJobService';
import { ListJobsService } from '@/application/jobs/services/ListJobService';
import { GetJobDetailService } from '@/application/jobs/services/GetJobDetailService';
import GetJobLogsService from '@/application/jobs/services/GetJobLogService';
import { StreamJobLogsService } from '@/application/jobs/services/StreamJobLogService';
import { ScheduleJobService } from '@/application/jobs/services/ScheduleJobService';

// ── Domain ──────────────────────────────────────────────────────
import { JobType } from '@/domain/jobs/value-objects/JobType';

// ── Scoreboard Services (via DI container) ──────────────────────
import { scoreboardSyncService, getScoresByDateService } from '@/infrastructure/dependencies';

// ── Presentation ────────────────────────────────────────────────
import { JobController } from '@/presentation/controllers/JobController';

/**
 * Central factory for all Job subsystem components.
 * Combines repositories, log streaming, job runner, cron scheduling,
 * and attaches scoreboard sync endpoints (/by-week, /by-date).
 */
export function buildJobsModule() {
  // ── Core Repositories & Infrastructure ───────────────────────
  const jobRepo = new PrismaJobRepository(prisma);
  const logRepo = new PrismaJobLogRepository(prisma);
  const emitter = new JobLogEmitter();
  const runner = new InProcessJobRunner();

  // ── Register Job Handlers with Runner ─────────────────────────
  runner.register(JobType.SYNC_TEAMS, async (_payload, ctx) => {
    await ctx.log('info', 'Invoking SyncTeamsService...');
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    await new Promise((r) => setTimeout(r, 500));
    await ctx.log('info', 'SyncTeams completed');
    return { code: 'ok', data: { synced: true } };
  });

  runner.register(JobType.BACKFILL_SEASON, async (payload, ctx) => {
    const { seasonYear } = (payload ?? {}) as { seasonYear?: number };
    await ctx.log('info', `Backfilling season year=${seasonYear ?? 'n/a'}`);
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };
    await new Promise((r) => setTimeout(r, 1000));
    await ctx.log('info', 'BackfillSeason completed');
    return { code: 'ok', data: { year: seasonYear, games: 256 } };
  });

  // --- Import Scores By Week ---
  runner.register(JobType.IMPORT_SCORES_WEEK, async (payload, ctx) => {
    const { year, seasonType, week } = (payload ?? {}) as {
      year?: number;
      seasonType?: 1 | 2 | 3;
      week?: number;
    };
    await ctx.log('info', `Importing weekly scores: year=${year} type=${seasonType} week=${week}`)
    const result = await scoreboardSyncService.runWeek({
      seasonYear: String(year),
      seasonType: seasonType ?? 2,
      week: week ?? 1,
    });

    await ctx.log('info', `Scoreboard sync complete: events=${result.processed}`)

    return { code: 'ok', data: result };
  });

  // --- Import Scores By Date ---
  runner.register(JobType.IMPORT_SCORES_DATE, async (payload, ctx) => {
    const { date } = (payload ?? {}) as { date?: string };
    if (!date) return { code: 'error', message: 'Missing date in payload' };

    await ctx.log('info', `Starting score import for date=${date}`);
    if (await ctx.shouldCancel?.()) return { code: 'canceled' };

    const result = await getScoresByDateService.run({ date });
    await ctx.log('info', `✅ Completed date import for ${date}`);
    return { code: 'ok', data: result };
  });

  // ── Application Services Layer ────────────────────────────────
  const queue = new QueueJobService(jobRepo);
  const run = new RunJobService(jobRepo, logRepo, runner, emitter);
  const cancel = new CancelJobService(jobRepo);
  const list = new ListJobsService(jobRepo);
  const getDetail = new GetJobDetailService(jobRepo);
  const getLogs = new GetJobLogsService(logRepo);
  const stream = new StreamJobLogsService(emitter);
  const scheduler = new ScheduleJobService(new CronScheduler(queue, run));

  // ── Controller + Express Router ───────────────────────────────
  const ctl = new JobController(queue, run, cancel, list, getDetail, getLogs, scheduler);
  const r = Router();

  // CRUD + Management Routes
  r.post('/', ctl.queue.bind(ctl));
  r.post('/:id/run', ctl.run.bind(ctl));
  r.post('/:id/cancel', ctl.cancel.bind(ctl));
  r.get('/', ctl.list.bind(ctl));
  r.get('/:id', ctl.detail.bind(ctl));
  r.get('/:id/logs', ctl.logs.bind(ctl));

  // --- Scoreboard Routes ---
  // Accept GET or POST for by-week
  r.all('/kickoff/scoreboard/by-week', async (req, res) => {
    const seasonYear = req.body.seasonYear || req.query.seasonYear;
    const seasonType = req.body.seasonType || req.query.seasonType;
    const week = req.body.week || req.query.week;

    if (!seasonYear || !seasonType || !week) {
      return res.status(400).json({ error: 'seasonYear, seasonType, and week are required' });
    }

    try {
      const result = await scoreboardSyncService.runWeek({
        seasonYear: String(seasonYear),
        seasonType: Number(seasonType) as any,
        week: Number(week),
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('❌ /kickoff/scoreboard/by-week error:', err);
      return res.status(500).json({ error: err.message ?? 'Internal server error' });
    }
  });

  // Accept GET or POST for by-date
  r.all('/kickoff/scoreboard/by-date', async (req, res) => {
    const date = req.body.date || req.query.date;
    if (!date) {
      return res.status(400).json({ error: 'date required in YYYYMMDD format' });
    }

    if (!/^\d{8}$/.test(String(date))) {
      return res.status(400).json({ error: 'Invalid date format (expected YYYYMMDD)' });
    }

    try {
      const result = await getScoresByDateService.run({ date: String(date) });
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('❌ /kickoff/scoreboard/by-date error:', err);
      return res.status(500).json({ error: err.message ?? 'Internal server error' });
    }
  });

  // ── Return unified module ────────────────────────────────────
  return { routes: r, prisma, runner, scheduler };
}

// Export only the router for Express mounting
export const { routes: jobRoutes } = buildJobsModule();
