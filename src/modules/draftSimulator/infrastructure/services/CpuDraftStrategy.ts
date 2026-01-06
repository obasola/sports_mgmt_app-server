// sports_mgmt_app_server/src/modules/draftSimulator/infrastructure/services/CpuDraftStrategy.ts
import type { AvailableProspect } from '../../domain/repositories/ProspectRepository'
import type { TeamNeedWeight } from '../../domain/repositories/TeamNeedRepository'

export class CpuDraftStrategy {
  public pickProspect(args: {
    available: AvailableProspect[]
    teamNeeds: TeamNeedWeight[]
  }): AvailableProspect {
    if (args.available.length === 0) {
      throw new Error('No available prospects to pick.')
    }

    const needMap = new Map<string, number>()
    for (const n of args.teamNeeds) needMap.set(n.position.toUpperCase(), n.weight)

    let best = args.available[0]
    let bestScore = Number.NEGATIVE_INFINITY

    for (const p of args.available) {
      const need = needMap.get(p.position.toUpperCase()) ?? 1
      const base = 1000 - p.overallRank
      const score = base + need * 40 + (p.id % 7) // deterministic “noise”
      if (score > bestScore) {
        bestScore = score
        best = p
      }
    }

    return best
  }
}
