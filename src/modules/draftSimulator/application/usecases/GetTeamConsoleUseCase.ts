import type { DraftSimulationRepository } from '../../domain/repositories/DraftSimulationRepository'
import type { TeamNeedRepository } from '../../domain/repositories/TeamNeedRepository'
import type {
  TeamConsoleDto,
  TeamConsoleNeedDto,
  PositionRunWarningDto
} from '../dto/TeamConsoleDto'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function weightFromPriority(priority: number): number {
  const p = clamp(priority, 1, 5)
  return 6 - p // P1->5, P5->1
}

export class GetTeamConsoleUseCase {
  public constructor(
    private readonly simRepo: DraftSimulationRepository,
    private readonly needRepo: TeamNeedRepository
  ) {}

  public async execute(simulationId: number): Promise<TeamConsoleDto> {
    const state = await this.simRepo.getState(simulationId)

    const onClockPick = state.picks.find((p) => p.overallPick === state.currentOverallPick) ?? null
    if (!onClockPick) {
      return {
        simulationId: state.simulationId,
        draftYear: state.draftYear,
        onClock: null,
        needsRemaining: [],
        runWarnings: [],
        nextPicks: []
      }
    }

    const teamId = onClockPick.currentTeamId

    // ---- 1) Needs Remaining (smart) ----
    // Pull top needs (grab a few extra so the list stays meaningful after adjustments)
    const rawNeeds = await this.needRepo.listTopNeeds(teamId, state.draftYear, 10)

    // Count drafted positions for this team
    const draftedPositions = state.picks
      .filter((p) => p.currentTeamId === teamId && p.draftedProspect)
      .map((p) => p.draftedProspect!.position.toUpperCase())

    const draftedCountByPos = new Map<string, number>()
    for (const pos of draftedPositions) {
      draftedCountByPos.set(pos, (draftedCountByPos.get(pos) ?? 0) + 1)
    }

    const needsRemaining: TeamConsoleNeedDto[] = rawNeeds
      .map((n) => {
        const pos = n.position.toUpperCase()
        const draftedCount = draftedCountByPos.get(pos) ?? 0
        const baseWeight = weightFromPriority(n.priority)
        const adjustedWeight = clamp(baseWeight - draftedCount, 1, 5)

        return {
          position: pos,
          priority: clamp(n.priority, 1, 5),
          baseWeight,
          draftedCount,
          adjustedWeight
        }
      })
      // Sort “remaining urgency” first, then original priority
      .sort((a, b) => (b.adjustedWeight - a.adjustedWeight) || (a.priority - b.priority))
      .slice(0, 5)

    const relevantNeedPositions = new Set(
      needsRemaining.filter((n) => n.adjustedWeight >= 3).map((n) => n.position)
    )

    // ---- 2) Positional Run Warnings (PFN feel) ----
    const window = 10
    const draftedAll = state.picks.filter((p) => p.draftedProspect)
    const recent = draftedAll.slice(Math.max(0, draftedAll.length - window))

    const recentCounts = new Map<string, number>()
    for (const p of recent) {
      const pos = p.draftedProspect!.position.toUpperCase()
      recentCounts.set(pos, (recentCounts.get(pos) ?? 0) + 1)
    }

    const runWarnings: PositionRunWarningDto[] = Array.from(recentCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([position, count]) => ({
        position,
        count,
        window,
        severity: (count >= 4 ? 'hot' : 'warm') as 'hot' | 'warm',
        relevantToNeeds: relevantNeedPositions.has(position)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // ---- 3) Next Picks list ----
    const nextPicks = state.picks
      .filter((p) => p.overallPick >= state.currentOverallPick && p.draftedProspectId === null)
      .slice(0, 8)
      .map((p) => ({
        overallPick: p.overallPick,
        roundNbr: p.roundNbr,
        pickInRound: p.pickInRound,
        teamId: p.currentTeamId,
        teamAbbr: p.currentTeamAbbr
      }))

    return {
      simulationId: state.simulationId,
      draftYear: state.draftYear,
      onClock: {
        overallPick: onClockPick.overallPick,
        roundNbr: onClockPick.roundNbr,
        pickInRound: onClockPick.pickInRound,
        teamId: onClockPick.currentTeamId,
        teamAbbr: onClockPick.currentTeamAbbr
      },
      needsRemaining,
      runWarnings,
      nextPicks
    }
  }
}
