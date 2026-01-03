import type { GameFact } from '@/modules/draftOrder/domain/repositories/GameFactsRepository'
import type {
  CreateDraftOrderEntryRequest,
  CreateDraftOrderSnapshotRequest,
  CreateDraftOrderTiebreakAuditRequest,
} from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'
import { sha256Hex } from '@/modules/draftOrder/application/utils/sha256'

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
  // Prisma Decimal accepts string; keep stable precision
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

export class ComputeCurrentDraftOrderService {
  public compute(args: {
    seasonYear: string
    seasonType: number
    throughWeek: number | null
    games: ReadonlyArray<GameFact>
  }): { snapshot: CreateDraftOrderSnapshotRequest } {
    const { seasonYear, seasonType, throughWeek, games } = args

    const teams = new Map<number, TeamAgg>()

    const ensure = (teamId: number): TeamAgg => {
      const existing = teams.get(teamId)
      if (existing) return existing
      const created: TeamAgg = { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, opponents: [] }
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

    // SOS = opponents combined winPct (simple implementation; stable and deterministic)
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

    // Draft order: worst record first => winPct ASC.
    // Tie: LOWER SOS picks earlier => sos ASC.
    // Fallback: lower point differential picks earlier => (PF-PA) ASC.
    rows.sort((a, b) => {
      if (a.winPct !== b.winPct) return a.winPct - b.winPct
      if (a.sos !== b.sos) return a.sos - b.sos
      const aDiff = a.pointsFor - a.pointsAgainst
      const bDiff = b.pointsFor - b.pointsAgainst
      if (aDiff !== bDiff) return aDiff - bDiff
      return a.teamId - b.teamId
    })

    const entries: CreateDraftOrderEntryRequest[] = rows.map((r, idx) => {
      const audits: CreateDraftOrderTiebreakAuditRequest[] = [
        {
          stepNbr: 1,
          ruleCode: 'WIN_PCT',
          resultCode: 'APPLIED',
          resultSummary: `winPct=${toDec5(r.winPct)}`,
          detailsJson: { wins: r.wins, losses: r.losses, ties: r.ties },
        },
        {
          stepNbr: 2,
          ruleCode: 'SOS',
          resultCode: 'APPLIED',
          resultSummary: `sos=${toDec5(r.sos)}`,
          detailsJson: null,
        },
        {
          stepNbr: 3,
          ruleCode: 'POINT_DIFF',
          resultCode: 'APPLIED',
          resultSummary: `diff=${r.pointsFor - r.pointsAgainst}`,
          detailsJson: { pointsFor: r.pointsFor, pointsAgainst: r.pointsAgainst },
        },
      ]

      return {
        teamId: r.teamId,
        draftSlot: idx + 1,
        isPlayoff: false,
        isProjected: false,
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

    // ---- inputHash: include stable digest of game facts used ----
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
        mode: 'current',
        strategy: null,
        seasonYear,
        seasonType,
        throughWeek, // null vs number is preserved and intentional
        games: gameDigest,
      })
    )

    const snapshot: CreateDraftOrderSnapshotRequest = {
      mode: 'current',
      strategy: null,
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
