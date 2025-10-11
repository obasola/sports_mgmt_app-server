// src/infrastructure/repositories/PrismaJobLogger.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { IJobLogger, JobLogDetail, JobStartOptions } from "../../jobs/IJobLogger";

type JobStatusDB = "pending" | "in_progress" | "completed" | "failed" | "canceled";

export class PrismaJobLogger implements IJobLogger {
  constructor(private prisma: PrismaClient) {}
  
  async start(opts: JobStartOptions): Promise<{ jobId: number }> {
    const job = await this.prisma.job.create({
      data: {
        type: opts.jobType,
        status: "in_progress" as JobStatusDB,
        payload: opts.params ?? {},
        startedAt: new Date(),
        // createdAt is DB default
      },
      select: { id: true },
    });
    return { jobId: job.id };
  }

  async log(jobId: number, detail: JobLogDetail): Promise<void> {
    await this.prisma.jobLog.create({
      data: {
        jobId,
        level: "info", // or 'debug' | 'warn' | 'error' if you pass different levels later
        message: detail.message,
        // createdAt is DB default
      },
    });
  }

  async succeed(jobId: number, summary?: Record<string, any>): Promise<void> {
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: "completed" as JobStatusDB,
        finishedAt: new Date(),
        resultCode: "OK",
        resultJson: (summary as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async fail(jobId: number, error: string, meta?: Record<string, any>): Promise<void> {
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed" as JobStatusDB,
        finishedAt: new Date(),
        resultCode: "ERROR",
        // No errorMessage column in your schema; store details in resultJson
        resultJson: { error, ...(meta ?? {}) },
      },
    });
    // Also insert a JobLog at 'error' level for quick scanning
    await this.prisma.jobLog.create({
      data: {
        jobId,
        level: "error",
        message: error,
      },
    });
  }
}
