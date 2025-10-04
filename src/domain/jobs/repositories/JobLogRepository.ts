// src/domain/jobs/repositories/JobLogRepository.ts
import { JobLog, LogLevel } from '../entities/JobLog';


export interface GetLogsQuery { afterId?: number; limit?: number; }

export interface JobLogRepository {
  append(log: JobLog): Promise<JobLog>;
  list(jobId: number, query?: GetLogsQuery): Promise<JobLog[]>;
  listByJobId(jobId: number, sinceId: number | undefined): Promise<JobLog[]>;
}
