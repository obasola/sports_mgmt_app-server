#!/usr/bin/env node
// src/cli/ingest.ts
import { Command } from 'commander'
import dotenv from 'dotenv'
import path from 'node:path'
import pLimit from 'p-limit'
import { prisma } from '@/lib/prisma'
import { JobService, JobType } from '@/services/JobService'
import { attachAndRunJob } from '@/services/runJobAttach'
import { endpoints } from '@/espn/endpoints'
import { getJson } from '@/espn/espnClient'
import { upsertEspnTeams } from '@/espn/mappers/teamMapper'
import { upsertEspnPlayers } from '@/espn/mappers/playerMapper'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const program = new Command().name('ingest')

program.command('teams')
  .option('--job-id <id>', 'use existing job id')
  .action(async (opts) => {
    const jobId = opts.jobId ? Number(opts.jobId) : (await JobService.start('TEAM_SYNC', { source: 'cli' })).id
    await attachAndRunJob(jobId, 'TEAM_SYNC', async ({ report }) => {
      const raw = await getJson(endpoints.teams())
      const n = await upsertEspnTeams(raw)
      await report(n, 0)
      console.log(`teams processed=${n}`)
    })
  })

program.command('roster')
  .option('-t, --team <team>', 'abbr or id', 'kc')
  .option('--job-id <id>', 'use existing job id')
  .action(async (opts) => {
    const team = String(opts.team)
    const jobId = opts.jobId ? Number(opts.jobId) : (await JobService.start('PLAYER_SYNC', { source: 'cli', team })).id
    await attachAndRunJob(jobId, 'PLAYER_SYNC', async ({ report }) => {
      const raw = await getJson(endpoints.teamRoster(team))
      const n = await upsertEspnPlayers(raw)
      await report(n, 0)
      console.log(`players(${team}) processed=${n}`)
    })
  })

program.command('rosters:all')
  .option('-c, --concurrency <n>', 'max concurrent', '3')
  .option('--job-id <id>', 'use existing job id')
  .action(async (opts) => {
    const conc = Number(opts.concurrency ?? 3)
    const jobId = opts.jobId ? Number(opts.jobId) : (await JobService.start('PLAYER_SYNC', { source: 'cli', kind: 'all' })).id
    await attachAndRunJob(jobId, 'PLAYER_SYNC', async ({ report }) => {
      const teams = await prisma.espn_teams.findMany({ select: { espn_id: true, abbreviation: true } })
      const limit = pLimit(conc)
      let processed = 0, failed = 0
      await Promise.all(teams.map(t => limit(async () => {
        try {
          const raw = await getJson(endpoints.teamRoster(t.espn_id))
          const n = await upsertEspnPlayers(raw)
          processed += n
          await report(n, 0)
        } catch {
          failed += 1
          await report(0, 1)
        }
      })))
      console.log(`done processed=${processed} failed=${failed}`)
    })
  })

program.parseAsync()
