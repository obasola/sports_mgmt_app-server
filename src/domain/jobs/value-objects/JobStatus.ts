// src/domain/jobs/value-objects/JobStatus.ts
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}