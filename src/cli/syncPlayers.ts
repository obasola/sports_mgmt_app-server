#!/usr/bin/env ts-node
// src/cli/syncPlayers.ts
import 'dotenv/config'
import { EspnPlayerClient } from '@/infrastructure/espn/EspnPlayerClient'
import { PrismaPlayerRepository } from '@/infrastructure/repositories/PrismaPlayerRepository'
import { PrismaPlayerTeamRepository } from '@/infrastructure/repositories/PrismaPlayerTeamRepository'
import { PlayerSyncService } from '@/application/player/services/PlayerSyncService'
import { PrismaJobLogger } from '@/infrastructure/repositories/PrismaJobLogger'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const jobLogger = new PrismaJobLogger(prisma);
function parseArgs(argv: string[]) {
  const result: Record<string, string> = {}
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [key, val] = a.slice(2).split('=')
      result[key] = val ?? 'true'
    }
  }
  return result
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const teamEspnId = args.teamEspnId ? Number(args.teamEspnId) : undefined

  const svc = new PlayerSyncService(
    new EspnPlayerClient(),
    new PrismaPlayerRepository(),
    new PrismaPlayerTeamRepository(),
    undefined,
    jobLogger
  )

  if (teamEspnId) {
    const res = await svc.runTeam(teamEspnId)
    console.log(`✅ Synced team ${teamEspnId}: ${res.players} players`)
  } else {
    const res = await svc.runAllTeams()
    console.log(`✅ Synced all teams: ${res.players} players across ${res.teams} teams`)
  }
}

main().catch((err) => {
  console.error('❌ syncPlayers failed:', err)
  process.exit(1)
})
