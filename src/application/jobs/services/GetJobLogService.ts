// src/application/jobs/services/GetJobLogsService.ts
import { JobLogRepository } from '../../../domain/jobs/repositories/JobLogRepository';
import { JobLog } from '../../../domain/jobs/entities/JobLog';

export default class GetJobLogService {
  constructor(private readonly logs: JobLogRepository) {}
  async execute(jobId: number, sinceId?: number): Promise<JobLog[]> {
    return this.logs.listByJobId(jobId, sinceId);
    }
}