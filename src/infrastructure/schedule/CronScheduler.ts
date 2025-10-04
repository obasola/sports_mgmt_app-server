// src/infrastructure/schedule/CronScheduler.ts
import cron, { ScheduledTask } from 'node-cron';
import { CreateJobRequest } from '../../application/jobs/dto/CreateJobRequest';
import { QueueJobService } from '../../application/jobs/services/QueueJobService';
import { RunJobService } from '../../application/jobs/services/RunJobService';

export interface ScheduledItem {
  id: string;
  cron: string;
  enabled: boolean;
  req?: CreateJobRequest; // present when using CreateJobRequest branch
}

export class CronScheduler {
  private tasks = new Map<string, ScheduledTask>();
  private registry = new Map<string, ScheduledItem>();

  constructor(
    private readonly queue: QueueJobService,
    private readonly run: RunJobService
  ) {}

  /**
   * Register a cron task.
   * - Pass a CreateJobRequest -> it will queue + run the job each trigger.
   * - Or pass a custom async factory -> you fully control the work.
   */
  register(
    id: string,
    expr: string,
    job: CreateJobRequest | (() => Promise<void>),
    active = true
  ) {
    // replace if exists
    this.unregister(id);

    const task = cron.schedule(expr, async () => {
      if (typeof job === 'function') {
        await job();
      } else {
        // IMPORTANT: use your QueueJobService.execute (not exec)
        const created = await this.queue.execute(job);

        // Support either naming in RunJobService: prefer exec, fallback to run
        const anyRun = this.run as unknown as { exec?: (id: number) => Promise<void>; run?: (id: number) => Promise<void> };
        if (typeof anyRun.exec === 'function') {
          await anyRun.exec(created.id!);
        } else if (typeof anyRun.run === 'function') {
          await anyRun.run(created.id!);
        } else {
          throw new Error('RunJobService must expose exec(jobId:number) or run(jobId:number)');
        }
      }
    });

    if (!active) task.stop(); // avoid typed options ({ scheduled: ... }) to prevent TS error

    this.tasks.set(id, task);
    this.registry.set(id, {
      id,
      cron: expr,
      enabled: active,
      req: typeof job === 'function' ? undefined : job,
    });
  }

  /** Stop and remove a task by id */
  unregister(id: string) {
    const t = this.tasks.get(id);
    if (t) {
      try { t.stop(); } catch {}
      this.tasks.delete(id);
    }
    this.registry.delete(id);
  }

  /** Enable/disable a task without removing it */
  toggle(id: string, enabled: boolean) {
    const t = this.tasks.get(id);
    if (!t) return;
    enabled ? t.start() : t.stop();
    const meta = this.registry.get(id);
    if (meta) this.registry.set(id, { ...meta, enabled });
  }

  /** List current scheduled items */
  list(): ScheduledItem[] {
    return Array.from(this.registry.values());
  }
}
