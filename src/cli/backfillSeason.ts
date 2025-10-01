#!/usr/bin/env ts-node
/* eslint-disable no-console */
// src/cli/backfillSeason.ts
import 'dotenv/config'
import { backfillSeasonService } from '../infrastructure/dependencies'
import type { SeasonType } from '../infrastructure/scoreboardClient'

// minimal flag+positional parser
function parseArgv(argv: string[]) {
  const out: Record<string, string> = {}
  const pos: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const eq = a.indexOf('=')
      if (eq > -1) out[a.slice(2, eq)] = a.slice(eq + 1)
      else {
        const key = a.slice(2)
        const next = argv[i + 1]
        if (next && !next.startsWith('-')) { out[key] = next; i++ }
        else out[key] = 'true'
      }
    } else {
      pos.push(a)
    }
  }
  return { flags: out, pos }
}

async function main() {
  const { flags, pos } = parseArgv(process.argv.slice(2))

  const yearStr = flags.year ?? pos[0]
  const seasonTypeStr = (flags.seasonType ?? flags.season ?? pos[1])

  if (!yearStr || !seasonTypeStr) {
    console.error('Usage: ts-node src/cli/backfillSeason.ts <year> <seasonType>\n       ts-node src/cli/backfillSeason.ts --year=2025 --seasonType=2')
    process.exit(1)
  }

  const year = parseInt(yearStr, 10)
  const seasonType = parseInt(seasonTypeStr, 10) as SeasonType

  const result = await backfillSeasonService.run({ year, seasonType })
  console.log(`✅ Backfill complete for year ${year}, seasonType ${seasonType}: processed=${result.processed}, failed=${result.failed}`)
}

main().catch((err) => {
  console.error('❌ backfillSeason failed:', err)
  process.exit(1)
})
