// src/presentation/controllers/jobController.ts
import { Request, Response } from 'express'
import { PrismaClient, Prisma, type Job_status } from '@prisma/client'
import { ParsedQs } from 'qs'
import { runImportNflSeasonJob } from '../../application/services/importer/runImportJob'

const prisma = new PrismaClient()
const ALLOWED: Array<Job_status> = ['pending','in_progress','completed','failed','canceled'];

// Flatten Express/qs query values into an array of strings
function stringsFromQueryValue(
  val: undefined | string | ParsedQs | (string | ParsedQs)[]
): string[] {
  if (val == null) return []
  if (typeof val === 'string') return [val]
  if (Array.isArray(val)) return val.flatMap(stringsFromQueryValue)
  // ParsedQs object: flatten its values recursively
  return Object.values(val).flatMap(stringsFromQueryValue)
}

// Parse status=? to JobStatus[]
function parseStatusQuery(
  statusVal: undefined | string | ParsedQs | (string | ParsedQs)[]
): Job_status[] {
  const raw = stringsFromQueryValue(statusVal).flatMap((s) => s.split(','));
  const normalized = raw
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is Job_status => (ALLOWED as string[]).includes(s));
  return normalized;
}
export async function listJobs(req: Request, res: Response) {
  const statuses = parseStatusQuery(req.query.status)

  const where: Prisma.JobWhereInput = {}
  if (statuses.length === 1) where.status = statuses[0]
  else if (statuses.length > 1) where.status = { in: statuses }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  res.json(jobs)
}

export async function getJob(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id)
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) {
    return res.status(404).json({ message: 'Not found' })
  }
  return res.json(job)
}

export async function getJobLogs(req: Request, res: Response) {
  const id = Number(req.params.id)
  const logs = await prisma.jobLog.findMany({
    where: { jobId: id },
    orderBy: { createdAt: 'asc' },
  })
  res.json(logs)
}

export async function enqueueImport(req: Request, res: Response) {
  const { year, seasons } = req.body as { year: number; seasons: ('pre'|'reg'|'post')[] }
  const job = await prisma.job.create({
    data: { type: 'IMPORT_NFL_SEASON', payload: { year, seasons }, status: 'pending' },
  })
  setImmediate(async () => {
    try { await runImportNflSeasonJob({ year, seasons }, job.id) } catch { /* already recorded */ }
  })
  res.status(202).json({ jobId: job.id, status: 'queued' })
}
