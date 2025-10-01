// src/services/runJobAttach.ts
import { JobService, JobStatus, JobType } from '@/services/JobService'

export async function attachAndRunJob<T>(
  jobId: number,
  job_type: JobType,
  task: (ctx: { report: (dProcessed?: number, dFailed?: number) => Promise<void> }) => Promise<T>
) {
  await JobService.markRunning(jobId)
  const report = (p = 0, f = 0) => JobService.progress(jobId, p, f)

  try {
    const result = await task({ report })
    await JobService.finish(jobId, 'COMPLETED')
    return result
  } catch (e: any) {
    await JobService.finish(jobId, 'FAILED', { error: String(e?.message ?? e) })
    throw e
  }
}
