import { PrismaClient } from '@prisma/client'
import { importNflSeason, SeasonKind } from './nflSeason'

const prisma = new PrismaClient()

export async function runImportNflSeasonJob(payload: { year: number; seasons: SeasonKind[] }, jobId?: number) {
  const job = jobId
    ? await prisma.job.findUniqueOrThrow({ where: { id: jobId } })
    : await prisma.job.create({ data: { type: 'IMPORT_NFL_SEASON', payload, status: 'pending' } })

  await prisma.job.update({ where: { id: job.id }, data: { status: 'in_progress', startedAt: new Date() } })
  try {
    const result = await importNflSeason({ ...payload, jobId: job.id })
    const resultCode = result.failures.length ? 'PARTIAL' : 'OK'
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'completed', finishedAt: new Date(), resultCode, resultJson: result as any },
    })
    return { jobId: job.id, ...result }
  } catch (err: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'failed', finishedAt: new Date(), resultCode: 'ERROR', resultJson: { error: err?.message ?? String(err) } },
    })
    throw err
  }
}
