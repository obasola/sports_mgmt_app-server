// ==========================
// File: src/infrastructure/queue/JobLogEmitter.ts
// ==========================
import { EventEmitter } from 'events';
import { LogLevel } from '../../domain/jobs/entities/JobLog';

export interface JobLogEvent {
  id?: number;          // <-- make optional
  jobId: number;
  level: LogLevel;
  message: string;
  createdAt: string;
}

export class JobLogEmitter {
  private emitter = new EventEmitter();

  emit(jobId: number, level: LogLevel, message: string, id?: number) {
    const event: JobLogEvent = {
      id,
      jobId,
      level,
      message,
      createdAt: new Date().toISOString(),
    };
    this.emitter.emit(String(jobId), event);
  }

  subscribe(jobId: number, cb: (evt: JobLogEvent) => void) {
    const channel = String(jobId);
    this.emitter.on(channel, cb);
    return () => this.emitter.off(channel, cb);
  }
}
