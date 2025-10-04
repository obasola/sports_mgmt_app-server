// src/infrastructure/queue/InProcessJobRunner.ts
import { Job } from '../../domain/jobs/entities/Job';
import { JobType } from '../../domain/jobs/value-objects/JobType';

export type RunResult = { code?: string; result?: Record<string, unknown> };

export interface RunnerContext {
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => Promise<void>;
  shouldCancel: () => Promise<boolean>;
}

export type JobHandler = (job: Job, ctx: RunnerContext) => Promise<RunResult>;

export class InProcessJobRunner {
  private handlers = new Map<JobType, JobHandler>();

  register(type: JobType, handler: JobHandler) {
    this.handlers.set(type, handler);
  }

  async run(job: Job, ctx: RunnerContext): Promise<RunResult> {
    const handler = this.handlers.get(job.type as JobType);
    if (!handler) throw new Error(`No handler for type ${job.type}`);
    return handler(job, ctx);
  }
}
// --- Example handler registrations (plug in your real imports/services) ------
// You can move these to your composition root (di.ts) where real services exist.
export function registerDefaultHandlers(runner: InProcessJobRunner) {
  runner.register(JobType.SYNC_TEAMS, async (job, ctx) => {
    const { seasonYear } = (job.payload as any) ?? {};
    await ctx.log('info', `Starting sync for teams (${seasonYear})`);
    // TODO: call your SyncTeamsService here
    await sleepAndLog(ctx, 3, 'syncTeams');
    await ctx.log('info', 'Sync teams complete');
    return { code: 'OK', result: { synced: true } };
  });

  runner.register(JobType.BACKFILL_SEASON, async (job, ctx) => {
    const { seasonYear, seasonType, week } = (job.payload as any) ?? {};
    await ctx.log('info', `Backfill season ${seasonYear}, type ${seasonType}${week ? `, week ${week}` : ''}`);
    // TODO: call your BackfillSeasonService here (espn.getWeek, upsert, etc.)
    await sleepAndLog(ctx, 5, 'backfillSeason');
    await ctx.log('info', 'Backfill complete');
    return { code: 'OK', result: { processed: true } };
  });
}

async function sleepAndLog(ctx: RunnerContext, steps: number, label: string) {
  for (let i = 1; i <= steps; i++) {
    if (await ctx.shouldCancel()) {
      await ctx.log('warn', `${label}: cancellation detected at step ${i}`);
      throw new Error('canceled');
    }
    await ctx.log('debug', `${label}: step ${i}/${steps}`);
    await new Promise((r) => setTimeout(r, 400));
  }
}
