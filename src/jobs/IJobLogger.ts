export type JobPhase = "STARTED" | "PROGRESS" | "SUCCEEDED" | "FAILED";

export interface JobStartOptions {
  jobType: string;            // e.g., "IMPORT_SCORES_WEEK" | "SYNC_TEAMS" | "BACKFILL_SEASON"
  params?: Record<string, any>;
}

export interface JobLogDetail {
  message: string;
  meta?: Record<string, any>;
}

export interface IJobLogger {
  start(opts: JobStartOptions): Promise<{ jobId: number }>;
  log(jobId: number, detail: JobLogDetail): Promise<void>;
  succeed(jobId: number, summary?: Record<string, any>): Promise<void>;
  fail(jobId: number, error: string, meta?: Record<string, any>): Promise<void>;
}
