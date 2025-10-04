// src/application/jobs/dto/JobDto.ts
import { Job } from '../../../domain/jobs/entities/Job';
import { JobStatus } from '../../../domain/jobs/value-objects/JobStatus';
import { JobType } from '../../../domain/jobs/value-objects/JobType';

export interface JobDto {
  id: number;
  type: JobType;
  payload: unknown | null;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  cancelAt: string | null;
  cancelReason: string | null;
  resultCode: string | null;
  resultJson: Record<string, unknown> | null;
}

export const toJobDto = (j: Job): JobDto => ({
  id: j.id!,
  type: j.type,
  payload: j.payload,
  status: j.status,
  createdAt: j.createdAt.toISOString(),
  startedAt: j.startedAt ? j.startedAt.toISOString() : null,
  finishedAt: j.finishedAt ? j.finishedAt.toISOString() : null,
  cancelAt: j.cancelAt ? j.cancelAt.toISOString() : null,
  cancelReason: j.cancelReason,
  resultCode: j.resultCode,
  resultJson: j.resultJson,
});