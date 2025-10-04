// src/infrastructure/repositories/PrismaJobRepository.ts
import { Job_status, PrismaClient } from '@prisma/client';
import { JobRepository, ListJobsFilter, Pagination, PagedResult } from '../../domain/jobs/repositories/JobRepository';
import { Job } from '../../domain/jobs/entities/Job';
import { JobStatus } from '../../domain/jobs/value-objects/JobStatus';
import { JobType } from '../../domain/jobs/value-objects/JobType';

const toPrismaStatus = (s: JobStatus): Job_status => {
  switch (s) {
    case JobStatus.PENDING:   return Job_status.pending;
    case JobStatus.RUNNING:   return Job_status.in_progress;
    case JobStatus.COMPLETED: return Job_status.completed;
    case JobStatus.FAILED:    return Job_status.failed;
    case JobStatus.CANCELED:  return Job_status.canceled;
    default:                  return Job_status.pending; // safe default
  }
};

const fromPrismaStatus = (s: Job_status): JobStatus => {
  switch (s) {
    case Job_status.pending:   return JobStatus.PENDING;
    case Job_status.in_progress:   return JobStatus.RUNNING;
    case Job_status.completed: return JobStatus.COMPLETED;
    case Job_status.failed:    return JobStatus.FAILED;
    case Job_status.canceled:  return JobStatus.CANCELED;
  }
};

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private map(row: any): Job {
    return new Job(
      row.id,
      row.type as JobType,
      row.payload,
      fromPrismaStatus(row.status),
      row.createdAt,
      row.startedAt,
      row.finishedAt,
      row.cancelAt,
      row.cancelReason,
      row.resultCode,
      row.resultJson
    );
  }
  

  async create(job: Job): Promise<Job> {
    const row = await this.prisma.job.create({
      data: {
        type: job.type,
        payload: job.payload as any,
        status: toPrismaStatus(job.status),
        createdAt: job.createdAt,
      },
    });
    return this.map(row);
  }

  async update(job: Job): Promise<Job> {
    const row = await this.prisma.job.update({
      where: { id: job.id! },
      data: {
        type: job.type,
        payload: job.payload as any,
        status: toPrismaStatus(job.status),
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        cancelAt: job.cancelAt,
        cancelReason: job.cancelReason,
        resultCode: job.resultCode,
        resultJson: job.resultJson as any,
      },
    });
    return this.map(row);
  }

    async updateStatus(id: number, status: JobStatus, patch?: Partial<Job>): Promise<Job> {
    const row = await this.prisma.job.update({
      where: { id },
      data: {
        status: toPrismaStatus(status),
        // apply optional patch-throughs if you use this method
        ...(patch?.startedAt !== undefined ? { startedAt: patch.startedAt as any } : {}),
        ...(patch?.finishedAt !== undefined ? { finishedAt: patch.finishedAt as any } : {}),
        ...(patch?.cancelAt !== undefined ? { cancelAt: patch.cancelAt as any } : {}),
        ...(patch?.cancelReason !== undefined ? { cancelReason: patch.cancelReason as any } : {}),
        ...(patch?.resultCode !== undefined ? { resultCode: patch.resultCode as any } : {}),
        ...(patch?.resultJson !== undefined ? { resultJson: patch.resultJson as any } : {}),
      },
    });
    return this.map(row);
  }
  async findById(id: number): Promise<Job | null> {
    const row = await this.prisma.job.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async list(filter: ListJobsFilter, pg: Pagination): Promise<PagedResult<Job>> {
    const pageSize = pg.pageSize ?? 25;
    const page = pg.page ?? 1;
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((r) => this.map(r)),
      total,
      page,
      pageSize,
    };
  }
}

