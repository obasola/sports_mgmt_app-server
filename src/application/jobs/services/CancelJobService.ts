// src/application/jobs/services/CancelJobService.ts
import { JobRepository } from '../../../domain/jobs/repositories/JobRepository';

export class CancelJobService {
  constructor(private readonly jobs: JobRepository) {}
  async execute(jobId: number, reason = 'user-request'): Promise<void> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new Error('Job not found');
    job.cancel(reason);
    await this.jobs.update(job);
  }
}