// src/application/jobs/services/ListJobsService.ts
import { JobRepository, ListJobsFilter, Pagination, PagedResult } from '../../../domain/jobs/repositories/JobRepository';
import { Job } from '../../../domain/jobs/entities/Job';

export class ListJobsService {
  constructor(private readonly jobs: JobRepository) {}
  async execute(filter: ListJobsFilter, pg: Pagination): Promise<PagedResult<Job>> {
    return this.jobs.list(filter, pg);
  }
}