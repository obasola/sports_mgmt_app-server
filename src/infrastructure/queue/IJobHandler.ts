// src/infrastructure/queue/IJobHandler.ts
import { Job } from '@prisma/client';

/**
 * Callback function for reporting job progress
 */
export type JobProgressCallback = (job: Job) => Promise<void>;

/**
 * Result structure returned after job execution
 */
export interface JobResult {
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  itemsFailed: number;
  details: string;
  [key: string]: any; // Allow additional metadata
}

/**
 * Interface that all job handlers must implement
 * Follows Single Responsibility Principle - each handler processes one job type
 */
export interface IJobHandler {
  /**
   * Execute the job
   * @param job The job to execute
   * @param progressCallback Callback to report progress updates
   * @throws Error if job execution fails
   */
  execute(job: Job, progressCallback: JobProgressCallback): Promise<void>;
}

/**
 * Base abstract class for job handlers
 * Provides common functionality for progress tracking and completion
 */
export abstract class BaseJobHandler implements IJobHandler {
  constructor(protected prisma: any) {}

  abstract execute(job: Job, progressCallback: JobProgressCallback): Promise<void>;

  /**
   * Update job progress in database
   */
  protected async updateJobProgress(
    job: Job,
    current: number,
    total: number
  ): Promise<void> {
    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        resultJson: {
          progress: current,
          total: total,
          percentage: Math.round((current / total) * 100),
        },
      },
    });
  }

  /**
   * Mark job as completed with results
   */
  protected async completeJob(job: Job, result: JobResult): Promise<void> {
    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        resultCode: 'SUCCESS',
        resultJson: result,
      },
    });
  }

  /**
   * Mark job as failed with error details
   */
  protected async failJob(job: Job, error: Error): Promise<void> {
    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        resultCode: 'ERROR',
        resultJson: {
          error: error.message,
          stack: error.stack,
        },
      },
    });
  }

  /**
   * Mark job as in progress
   */
  protected async startJob(job: Job): Promise<void> {
    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }
}