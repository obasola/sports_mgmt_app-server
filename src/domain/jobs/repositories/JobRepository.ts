// src/domain/jobs/repositories/JobRepository.ts
import { Job } from '../entities/Job';
import { JobStatus } from '../value-objects/JobStatus';
import { JobType } from '../value-objects/JobType';

export interface ListJobsFilter {
  status?: JobStatus;
  type?: JobType;
}

export interface Pagination {
  page?: number; // 1-based
  pageSize?: number; // default 25
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JobRepository {
  create(job: Job): Promise<Job>;
  update(job: Job): Promise<Job>;
  findById(id: number): Promise<Job | null>;
  list(filter: ListJobsFilter, pg: Pagination): Promise<PagedResult<Job>>;
}

