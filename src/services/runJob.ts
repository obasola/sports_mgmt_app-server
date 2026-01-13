import { Prisma } from '@prisma/client';
import { JobService } from './JobService';

import type { JobType } from '@/services/JobService'  // ALWAYS use this
import { prisma } from "@/infrastructure/database/prisma";




export async function runJob<T>(
  job_type: JobType,
  metadata: Record<string, any> | undefined,
  task: (ctx: {
    jobId: number;
    report: (deltaProcessed?: number, deltaFailed?: number) => Promise<void>;
  }) => Promise<T>
) {
  // 1) create job (PENDING)
  const job = await JobService.start(job_type, metadata);

  // 2) mark RUNNING + started_at
  await prisma.data_processing_jobs.update({
    where: { id: job.id },
    data: { status: 'RUNNING', started_at: new Date() },
  });

  // Helper to bump progress during long tasks
  let processed = 0;
  let failed = 0;
  async function report(deltaProcessed = 0, deltaFailed = 0) {
    processed += deltaProcessed;
    failed += deltaFailed;
    await prisma.data_processing_jobs.update({
      where: { id: job.id },
      data: { processed_records: processed, failed_records: failed, updated_at: new Date() },
    });
  }

  try {
    const result = await task({ jobId: job.id, report });
    // If your task knows total, set it here; otherwise set to processed.
    const total = processed || undefined;

    await JobService.finish(job.id, 'COMPLETED', { total, processed, failed });
    return result;
  } catch (err: any) {
    await JobService.finish(job.id, 'FAILED', {
      processed,
      failed,
      error: String(err?.message ?? err),
    });
    throw err;
  }
}
