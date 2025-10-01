import { Router } from 'express'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import type { Request, Response } from 'express'

const router = Router()

// Simple list & get
router.get('/', async (req, res) => {
  const limit = Number(req.query.limit ?? 50)
  const jobs = await prisma.data_processing_jobs.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
  })
  res.json(jobs)
})
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const job = await prisma.data_processing_jobs.findUnique({
    where: { id: Number(req.params.id) },
  })

  if (!job) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  res.json(job)
})

// Fire-and-forget helper (ts-node in dev; swap to built file in prod if you compile)
function kickTsNode(args: string[]) {
  const cmd = path.resolve(process.cwd(), 'node_modules/.bin/ts-node')
  const child = spawn(cmd, args, { stdio: 'ignore', env: process.env })
  child.unref()
}

// Kickoffs
router.post('/kickoff/teams', async (_req, res) => {
  // Create the job row first so the UI can poll
  const job = await prisma.data_processing_jobs.create({
    data: { job_type: 'TEAM_SYNC', status: 'PENDING', started_at: new Date(), metadata: { source: 'api' } as any }
  })

  // ts-node -r tsconfig-paths/register src/cli/ingest.ts teams --job-id <id>
  kickTsNode([
    '-r','tsconfig-paths/register',
    path.resolve('src/cli/ingest.ts'),
    'teams','--job-id', String(job.id)
  ])

  res.status(202).json({ accepted: true, jobId: job.id })
})

router.post('/kickoff/roster', async (req, res) => {
  const team = String(req.body?.team ?? 'kc')
  const job = await prisma.data_processing_jobs.create({
    data: { job_type: 'PLAYER_SYNC', status: 'PENDING', started_at: new Date(), metadata: { source: 'api', team } as any }
  })

  kickTsNode([
    '-r','tsconfig-paths/register',
    path.resolve('src/cli/ingest.ts'),
    'roster','--team', team, '--job-id', String(job.id)
  ])

  res.status(202).json({ accepted: true, jobId: job.id, team })
})

export default router
