#!/usr/bin/env ts-node
/* eslint-disable no-console */
import 'dotenv/config'
import { syncTeamsService } from '../infrastructure/dependencies'

/**
 * Usage:
 *   ts-node src/cli/syncTeams.ts
 *
 * No args needed — pulls ESPN team list and syncs with local DB
 */
async function main() {
  await syncTeamsService.run()
  console.log('✅ Teams synced successfully from ESPN')
}

main().catch((err) => {
  console.error('❌ syncTeams failed:', err)
  process.exit(1)
})
