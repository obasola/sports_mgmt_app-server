// src/application/jobs/services/StreamJobLogsService.ts
import { JobLogEmitter, JobLogEvent } from '../../../infrastructure/queue/JobLogEmitter';

export type LogCallback = (evt: JobLogEvent) => void;

export class StreamJobLogsService {
  constructor(private readonly emitter: JobLogEmitter) {}
  subscribe(jobId: number, onEvent: LogCallback) {
    return this.emitter.subscribe(jobId, onEvent);
  }
}
