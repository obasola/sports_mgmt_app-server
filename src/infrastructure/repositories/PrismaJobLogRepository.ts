// src/infrastructure/repositories/PrismaJobLogRepository.ts
import { PrismaClient } from '@prisma/client';
import { GetLogsQuery, JobLogRepository } from '../../domain/jobs/repositories/JobLogRepository';
import { JobLog } from '../../domain/jobs/entities/JobLog';

export class PrismaJobLogRepository implements JobLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private map(row: any): JobLog {
    return new JobLog(row.id, row.jobId, row.level, row.message, row.createdAt);
  }

  async append(log: JobLog): Promise<JobLog> {
    const row = await this.prisma.jobLog.create({
      data: {
        jobId: log.jobId,
        level: log.level,
        message: log.message,
        createdAt: log.createdAt,
      },
    });
    return this.map(row);
  }

  async list(jobId: number, query?: GetLogsQuery): Promise<JobLog[]> {
    const where: any = { jobId };
    if (query?.afterId) where.id = { gt: query.afterId };
    const take = query?.limit ?? 500;
    const rows = await this.prisma.jobLog.findMany({
      where,
      orderBy: { id: 'asc' },
      take,
    });
    return rows.map(this.map);
  }

  async listByJobId(jobId: number, sinceId?: number): Promise<JobLog[]> {
    const rows = await this.prisma.jobLog.findMany({
      where: { jobId, ...(sinceId ? { id: { gt: sinceId } } : {}) },
      orderBy: { id: 'asc' },
      take: 1000,
    });
    return rows.map((r) => this.map(r));
  }
}
