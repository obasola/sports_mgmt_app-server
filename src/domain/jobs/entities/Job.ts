// src/domain/jobs/entities/Job.ts
import { JobStatus } from '../value-objects/JobStatus';
import { JobType } from '../value-objects/JobType';

export interface ResultJson {
  [k: string]: unknown;
}

export class Job {
  constructor(
    public id: number | null,
    public type: JobType,
    public payload: unknown | null,
    public status: JobStatus = JobStatus.PENDING,
    public createdAt: Date = new Date(),
    public startedAt: Date | null = null,
    public finishedAt: Date | null = null,
    public cancelAt: Date | null = null,
    public cancelReason: string | null = null,
    public resultCode: string | null = null,
    public resultJson: ResultJson | null = null
  ) {}

  start(now = new Date()) {
    this.ensureAllowed([JobStatus.PENDING]);
    this.status = JobStatus.RUNNING;
    this.startedAt = now;
  }

  complete(code = 'OK', result: ResultJson | null = null, now = new Date()) {
    this.ensureAllowed([JobStatus.RUNNING]);
    this.status = JobStatus.COMPLETED;
    this.finishedAt = now;
    this.resultCode = code;
    this.resultJson = result;
  }

  fail(code = 'ERROR', result: ResultJson | null = null, now = new Date()) {
    this.ensureAllowed([JobStatus.RUNNING]);
    this.status = JobStatus.FAILED;
    this.finishedAt = now;
    this.resultCode = code;
    this.resultJson = result;
  }

  cancel(reason = 'user-request', now = new Date()) {
    this.ensureAllowed([JobStatus.PENDING, JobStatus.RUNNING]);
    this.status = JobStatus.CANCELED;
    this.cancelAt = now;
    this.cancelReason = reason;
    if (!this.finishedAt) this.finishedAt = now;
  }

  private ensureAllowed(allowed: JobStatus[]) {
    if (!allowed.includes(this.status)) {
      throw new Error(`Invalid transition from ${this.status}`);
    }
  }
}