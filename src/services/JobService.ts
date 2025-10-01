// src/services/JobService.ts
import { prisma } from '@/lib/prisma'

export type JobType =
  | 'PLAYER_SYNC' | 'TEAM_SYNC' | 'FULL_SYNC' | 'VALIDATION' | 'ENRICHMENT'
export type JobStatus =
  | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export class JobService {
  static start(job_type: JobType, metadata?: Record<string, any>) {
    return prisma.data_processing_jobs.create({
      data: {
        job_type,
        status: 'PENDING',
        started_at: new Date(),
        ...(metadata != null ? { metadata } : {}), // omit if null/undefined
      },
    })
  }
  static markRunning(id: number) {
    return prisma.data_processing_jobs.update({
      where: { id }, data: { status: 'RUNNING', started_at: new Date() }
    })
  }
  static finish(id: number, status: JobStatus, opts?: {
    total?: number, processed?: number, failed?: number, error?: string
  }) {
    return prisma.data_processing_jobs.update({
      where: { id },
      data: {
        status,
        completed_at: new Date(),
        total_records: opts?.total,
        processed_records: opts?.processed,
        failed_records: opts?.failed,
        error_message: opts?.error ?? undefined,
        updated_at: new Date()
      }
    })
  }
  /* Before
  static progress(id: number, dProcessed = 0, dFailed = 0) {
    return prisma.data_processing_jobs.update({
      where: { id },
      data: {
        processed_records: { increment: dProcessed },
        failed_records: { increment: dFailed },
        updated_at: new Date()
      }
    })
  */
    // AFTER:
  static async progress(id: number, dProcessed = 0, dFailed = 0): Promise<void> {
    await prisma.data_processing_jobs.update({
      where: { id },
      data: {
        processed_records: { increment: dProcessed },
        failed_records: { increment: dFailed },
        updated_at: new Date(),
      },
    })
  }
  
  static get(id: number) { return prisma.data_processing_jobs.findUnique({ where: { id } }) }
  static list(limit = 50) {
    return prisma.data_processing_jobs.findMany({ orderBy: { created_at: 'desc' }, take: limit })
  }
}
