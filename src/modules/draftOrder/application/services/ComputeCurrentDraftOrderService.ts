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

function mapCount<K extends string>(rows: ReadonlyArray<Row>, keyFn: (r: Row) => K): ReadonlyMap<K, number> {
  const m = new Map<K, number>()
  for (const r of rows) {
    const k = keyFn(r)
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
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

    // SOS = opponents combined winPct (simple + deterministic)
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

    // Stable ordering keys
    rows.sort((a, b) => {
      if (a.winPct !== b.winPct) return a.winPct - b.winPct
      if (a.sos !== b.sos) return a.sos - b.sos
      const aDiff = a.pointsFor - a.pointsAgainst
      const bDiff = b.pointsFor - b.pointsAgainst
      if (aDiff !== bDiff) return aDiff - bDiff
      return a.teamId - b.teamId
    })

    // --------- CLEAN “only the tie-breaker that resolved the tie” audits ---------
    // Use DECIMAL-STRING keys to avoid float equality traps.
    const winKey = (r: Row): string => toDec5(r.winPct)
    const sosKey = (r: Row): string => `${toDec5(r.winPct)}|${toDec5(r.sos)}`
    const diffKey = (r: Row): string =>
      `${toDec5(r.winPct)}|${toDec5(r.sos)}|${String(r.pointsFor - r.pointsAgainst)}`

    const winCounts = mapCount(rows, winKey)
    const sosCounts = mapCount(rows, sosKey)
    const diffCounts = mapCount(rows, diffKey)

    const buildAudit = (r: Row): CreateDraftOrderTiebreakAuditRequest[] => {
      const wk = winKey(r)
      const winGroupSize = winCounts.get(wk) ?? 0

      // No tie at all -> no audit
      if (winGroupSize <= 1) return []

      const sk = sosKey(r)
      const sosGroupSize = sosCounts.get(sk) ?? 0
      if (sosGroupSize <= 1) {
        // Tie existed at WIN_PCT; SOS resolved it for this team
        return [
          {
            stepNbr: 2,
            ruleCode: 'SOS',
            resultCode: 'APPLIED',
            resultSummary: `sos=${toDec5(r.sos)}`,
            detailsJson: { winPct: toDec5(r.winPct), winGroupSize },
          },
        ]
      }

      const dk = diffKey(r)
      const diffGroupSize = diffCounts.get(dk) ?? 0
      if (diffGroupSize <= 1) {
        // Still tied after SOS; point diff resolved it for this team
        const diff = r.pointsFor - r.pointsAgainst
        return [
          {
            stepNbr: 3,
            ruleCode: 'POINT_DIFF',
            resultCode: 'APPLIED',
            resultSummary: `diff=${diff}`,
            detailsJson: {
              winPct: toDec5(r.winPct),
              sos: toDec5(r.sos),
              pointsFor: r.pointsFor,
              pointsAgainst: r.pointsAgainst,
            },
          },
        ]
      }

      // Still tied after point diff -> deterministic fallback
      return [
        {
          stepNbr: 4,
          ruleCode: 'TEAM_ID',
          resultCode: 'APPLIED',
          resultSummary: `teamId=${r.teamId}`,
          detailsJson: { note: 'deterministic fallback' },
        },
      ]
    }
    // --------------------------------------------------------------------------

    const entries: CreateDraftOrderEntryRequest[] = rows.map((r, idx) => ({
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
      audits: buildAudit(r),
    }))

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
