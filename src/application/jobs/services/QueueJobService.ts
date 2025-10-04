// src/application/jobs/services/QueueJobService.ts
import { JobRepository } from '../../../domain/jobs/repositories/JobRepository';
import { Job } from '../../../domain/jobs/entities/Job';
import { JobStatus } from '../../../domain/jobs/value-objects/JobStatus';
import { JobType } from '../../../domain/jobs/value-objects/JobType';
import { CreateJobRequest } from '../dto/CreateJobRequest';

export class QueueJobService {
  constructor(private readonly jobs: JobRepository) {}
  async execute(req: CreateJobRequest): Promise<Job> {
    const job = new Job(
      null,
      req.type as JobType,
      req.payload,
      JobStatus.PENDING,
      new Date()
    );
    return await this.jobs.create(job);
  }
}
