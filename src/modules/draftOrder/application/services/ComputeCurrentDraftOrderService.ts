import type { GameFact } from '@/modules/draftOrder/domain/repositories/GameFactsRepository'
import type {
  CreateDraftOrderEntryRequest,
  CreateDraftOrderSnapshotRequest,
  CreateDraftOrderTiebreakAuditRequest,
} from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'
import { sha256Hex } from '@/modules/draftOrder/application/utils/sha256'

type DraftOrderMode = 'current' | 'projection'

interface TeamAgg {
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  opponents: number[]
}

function winPct(w: number, l: number, t: number): number {
  const g = w + l + t
  if (g === 0) return 0
  return (w + 0.5 * t) / g
}

function toDec5(x: number): string {
  return x.toFixed(5)
}

type GameDigest = {
  id: string
  week: number | null
  h: number
  a: number
  hs: number | null
  as: number | null
}

function cmpGameDigest(a: GameDigest, b: GameDigest): number {
  if (a.id !== b.id) return a.id < b.id ? -1 : 1
  const aw = a.week ?? -1
  const bw = b.week ?? -1
  if (aw !== bw) return aw - bw
  if (a.h !== b.h) return a.h - b.h
  if (a.a !== b.a) return a.a - b.a
  const ahs = a.hs ?? -1
  const bhs = b.hs ?? -1
  if (ahs !== bhs) return ahs - bhs
  const aas = a.as ?? -1
  const bas = b.as ?? -1
  return aas - bas
}

type Row = {
  teamId: number
  wins: number
  losses: number
  ties: number
  winPct: number
  sos: number
  pointsFor: number
  pointsAgainst: number
}

function pointDiff(r: Row): number {
  return r.pointsFor - r.pointsAgainst
}

function cmpFinalDraftOrder(a: Row, b: Row): number {
  if (a.winPct !== b.winPct) return a.winPct - b.winPct
  if (a.sos !== b.sos) return a.sos - b.sos
  const aDiff = pointDiff(a)
  const bDiff = pointDiff(b)
  if (aDiff !== bDiff) return aDiff - bDiff
  return a.teamId - b.teamId
}

/**
 * Returns contiguous groups where keys are equal according to cmpSameGroup.
 * Expects `rows` already sorted by the grouping key(s) that define adjacency.
 */
function findTieGroups(
  rows: readonly Row[],
  sameGroup: (a: Row, b: Row) => boolean
): ReadonlyArray<readonly Row[]> {
  const groups: Row[][] = []
  let i = 0
  while (i < rows.length) {
    const g: Row[] = [rows[i]]
    let j = i + 1
    while (j < rows.length && sameGroup(rows[j - 1], rows[j])) {
      g.push(rows[j])
      j++
    }
    if (g.length > 1) groups.push(g)
    i = j
  }
  return groups
}

export class ComputeCurrentDraftOrderService {
  public compute(args: {
    seasonYear: string
    seasonType: number
    throughWeek: number | null
    games: ReadonlyArray<GameFact>
    mode?: DraftOrderMode
    strategy?: string | null
  }): { snapshot: CreateDraftOrderSnapshotRequest } {
    const { seasonYear, seasonType, throughWeek, games } = args

    const mode: DraftOrderMode = args.mode ?? 'current'
    const strategy: string | null =
      mode === 'projection'
        ? typeof args.strategy === 'string' && args.strategy.length > 0
          ? args.strategy
          : 'baseline'
        : null
    const isProjected: boolean = mode === 'projection'

    const teams = new Map<number, TeamAgg>()

    const ensure = (teamId: number): TeamAgg => {
      const existing = teams.get(teamId)
      if (existing) return existing
      const created: TeamAgg = {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        opponents: [],
      }
      teams.set(teamId, created)
      return created
    }

    for (const g of games) {
      const home = ensure(g.homeTeamId)
      const away = ensure(g.awayTeamId)

      home.opponents.push(g.awayTeamId)
      away.opponents.push(g.homeTeamId)

      const hs = g.homeScore ?? 0
      const as = g.awayScore ?? 0

      home.pointsFor += hs
      home.pointsAgainst += as
      away.pointsFor += as
      away.pointsAgainst += hs

      if (hs > as) {
        home.wins += 1
        away.losses += 1
      } else if (as > hs) {
        away.wins += 1
        home.losses += 1
      } else {
        home.ties += 1
        away.ties += 1
      }
    }

    // SOS = opponents combined winPct (simple; deterministic)
    const sosByTeam = new Map<number, number>()
    for (const [teamId, agg] of teams.entries()) {
      let oppW = 0
      let oppL = 0
      let oppT = 0

      for (const oppId of agg.opponents) {
        const opp = teams.get(oppId)
        if (!opp) continue
        oppW += opp.wins
        oppL += opp.losses
        oppT += opp.ties
      }

      sosByTeam.set(teamId, winPct(oppW, oppL, oppT))
    }

    const rows: Row[] = Array.from(teams.entries()).map(([teamId, agg]) => ({
      teamId,
      wins: agg.wins,
      losses: agg.losses,
      ties: agg.ties,
      winPct: winPct(agg.wins, agg.losses, agg.ties),
      sos: sosByTeam.get(teamId) ?? 0,
      pointsFor: agg.pointsFor,
      pointsAgainst: agg.pointsAgainst,
    }))

    // Sort using the full comparator you actually use to assign slots.
    rows.sort(cmpFinalDraftOrder)

    // Determine which tiebreak steps were actually needed per row.
    // Strategy:
    // - Everyone gets step 1 (WIN_PCT).
    // - If there is any tie on winPct group that spans >1 teams, then those teams also get step 2.
    // - Within winPct ties, if there are ties on (winPct,sos) groups >1 teams, those teams also get step 3.
    const needsStep2 = new Set<number>()
    const needsStep3 = new Set<number>()

    const winPctTies = findTieGroups(rows, (a, b) => a.winPct === b.winPct)
    for (const g of winPctTies) {
      for (const r of g) needsStep2.add(r.teamId)
    }

    // Within tied winPct groups, check (winPct,sos) ties
    for (const g of winPctTies) {
      const sorted = [...g].sort(cmpFinalDraftOrder) // ensure adjacency by sos/diff/teamId
      const sosTies = findTieGroups(sorted, (a, b) => a.winPct === b.winPct && a.sos === b.sos)
      for (const sg of sosTies) {
        for (const r of sg) needsStep3.add(r.teamId)
      }
    }

    const entries: CreateDraftOrderEntryRequest[] = rows.map((r, idx) => {
      const audits: CreateDraftOrderTiebreakAuditRequest[] = []

      // Step 1 always
      audits.push({
        stepNbr: 1,
        ruleCode: 'WIN_PCT',
        resultCode: 'APPLIED',
        resultSummary: `winPct=${toDec5(r.winPct)}`,
        detailsJson: { wins: r.wins, losses: r.losses, ties: r.ties },
      })

      // Step 2 only if it was needed (winPct tie group)
      if (needsStep2.has(r.teamId)) {
        audits.push({
          stepNbr: 2,
          ruleCode: 'SOS',
          resultCode: 'APPLIED',
          resultSummary: `sos=${toDec5(r.sos)}`,
          detailsJson: null,
        })
      }

      // Step 3 only if it was needed (still tied after SOS)
      if (needsStep3.has(r.teamId)) {
        audits.push({
          stepNbr: 3,
          ruleCode: 'POINT_DIFF',
          resultCode: 'APPLIED',
          resultSummary: `diff=${pointDiff(r)}`,
          detailsJson: { pointsFor: r.pointsFor, pointsAgainst: r.pointsAgainst },
        })
      }

      return {
        teamId: r.teamId,
        draftSlot: idx + 1,
        isPlayoff: false,
        isProjected,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        winPct: toDec5(r.winPct),
        sos: toDec5(r.sos),
        pointsFor: r.pointsFor,
        pointsAgainst: r.pointsAgainst,
        audits,
      }
    })

    const gameDigest: GameDigest[] = games
      .map((g) => ({
        id: String(g.gameId),
        week: g.week ?? null,
        h: g.homeTeamId,
        a: g.awayTeamId,
        hs: g.homeScore ?? null,
        as: g.awayScore ?? null,
      }))
      .sort(cmpGameDigest)

    const inputHash = sha256Hex(
      JSON.stringify({
        mode,
        strategy,
        seasonYear,
        seasonType,
        throughWeek,
        games: gameDigest,
      })
    )

    const snapshot: CreateDraftOrderSnapshotRequest = {
      mode,
      strategy,
      seasonYear,
      seasonType,
      throughWeek,
      source: 'internal',
      inputHash,
      computedAt: new Date(),
      entries,
    }

    return { snapshot }
  }
}
