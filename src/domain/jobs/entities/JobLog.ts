// ==========================
// File: src/domain/jobs/entities/JobLog.ts
// ==========================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class JobLog {
  constructor(
    public readonly id: number | null,
    public readonly jobId: number,
    public readonly level: LogLevel,
    public readonly message: string,
    public readonly createdAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      jobId: this.jobId,
      level: this.level,
      message: this.message,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
