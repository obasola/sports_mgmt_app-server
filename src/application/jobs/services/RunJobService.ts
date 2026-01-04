// src/application/jobs/services/RunJobService.ts
import { JobRepository } from '../../../domain/jobs/repositories/JobRepository';
import { JobLogRepository } from '../../../domain/jobs/repositories/JobLogRepository';
import { Job } from '../../../domain/jobs/entities/Job';
import { JobStatus } from '../../../domain/jobs/value-objects/JobStatus';
//import { InProcessJobRunner, RunResult } from '../../../infrastructure/queue/InProcessJobRunner';
import { InProcessJobRunner } from '../../../infrastructure/queue/InProcessJobRunner';
import { JobLogEmitter } from '../../../infrastructure/queue/JobLogEmitter';
import { JobLog, LogLevel } from '@/domain/jobs/entities/JobLog';

// InProcessJobRunner.ts
export type RunResult = {
  readonly code?: string
  readonly result?: Record<string, unknown> | null
}

export class RunJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly logs: JobLogRepository,
    private readonly runner: InProcessJobRunner,
    private readonly emitter: JobLogEmitter
  ) {}

  async execute(jobId: number): Promise<Job> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new Error('Job not found');

    if (![JobStatus.PENDING].includes(job.status)) {
      throw new Error(`Job not runnable from status ${job.status}`);
    }

    job.start();
    await this.jobs.update(job);

    try {
      const res: RunResult = await this.runner.run(job, {
        log: async (level: LogLevel, message: string) => {
          // ✅ New log => id must be null; jobId is the job's id
          const saved = await this.logs.append(
            new JobLog(null, job.id!, level, message, new Date())
          );

          // ✅ Emit with the DB-assigned log id (if your emitter signature supports it)
          // If your emitter is emit(jobId, level, message) without id, just omit saved.id.
          this.emitter.emit(job.id!, level, message, saved.id ?? undefined);
        },
        shouldCancel: async () => {
          const latest = await this.jobs.findById(job.id!);
          return latest?.status === JobStatus.CANCELED;
        },
      });

      // Map RunResult fields to your Job.complete(...) shape
      
      //job.complete(res.code ?? 'OK', (res as any).result ?? (res as any).data ?? null);
      job.complete(res.code ?? 'OK', res.result ?? null)
      await this.jobs.update(job);
      return job;
    } catch (err: any) {
      job.fail('ERROR', { message: err?.message ?? String(err) });
      await this.jobs.update(job);
      throw err;
    }
  }
}
