// src/infrastructure/queue/JobLogEmitter.ts
import { EventEmitter } from 'events';

export type LogEvent = { id: number; jobId: number; level: string; message: string; createdAt: string };

export class JobLogEmitter {
  private ee = new EventEmitter();
  emitLog(log: { id: number; jobId: number; level: string; message: string; createdAt: Date }) {
    const evt: LogEvent = { ...log, createdAt: log.createdAt.toISOString() };
    this.ee.emit(this.key(log.jobId), evt);
  }
  subscribe(jobId: number, onEvent: (e: LogEvent) => void) {
    const key = this.key(jobId);
    this.ee.on(key, onEvent);
    return () => this.ee.off(key, onEvent);
  }
  private key(jobId: number) { return `job:${jobId}`; }
}