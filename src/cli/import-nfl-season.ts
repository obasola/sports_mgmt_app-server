#!/usr/bin/env ts-node
/* eslint-disable no-console */
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { runImportNflSeasonJob } from '../application/services/importer/runImportJob'

const argv = yargs(hideBin(process.argv))
  .option('year', { type: 'number', demandOption: true })
  .option('seasons', { type: 'array', default: ['pre','reg'], desc: 'Any of: pre, reg, post' })
  .help()
  .parseSync()

async function main() {
  const { year, seasons } = argv as unknown as { year: number; seasons: ('pre'|'reg'|'post')[] }
  const result = await runImportNflSeasonJob({ year, seasons })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
