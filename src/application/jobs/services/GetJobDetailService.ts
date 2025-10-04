// src/application/jobs/services/GetJobDetailService.ts
import { JobRepository } from '../../../domain/jobs/repositories/JobRepository';
import { Job } from '../../../domain/jobs/entities/Job';

export class GetJobDetailService {
  constructor(private readonly jobs: JobRepository) {}
  async execute(jobId: number): Promise<Job> {
    const job = await this.jobs.findById(jobId);
    if (!job) throw new Error('Job not found');
    return job;
  }
}
