// draftproanalytics-server/src/application/standings/services/PlayoffSeedingService.ts
import type { TeamStanding } from '@/domain/standings/interface/TeamStanding'
import type { GameWithTeams } from '@/application/standings/services/ComputeStandingsService'

export type Conference = 'AFC' | 'NFC'

export interface SeededTeam {
  teamId: number
  seed: number
  isDivisionWinner: boolean
}

type WLT = { w: number; l: number; t: number }
type TeamId = number

const norm = (v: unknown): string => String(v ?? '').trim().toUpperCase()

function pct(r: WLT): number {
  const total = r.w + r.l + r.t
  return total === 0 ? 0 : (r.w + 0.5 * r.t) / total
}

function isFinal(status: string | null | undefined): boolean {
  const s = String(status ?? '').trim().toLowerCase()
  return s.includes('final') || s.includes('complete') || s.includes('completed')
}

function safeNum(n: unknown): number | null {
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function pointDiff(s: TeamStanding): number {
  const pf = typeof s.pointsFor === 'number' ? s.pointsFor : 0
  const pa = typeof s.pointsAgainst === 'number' ? s.pointsAgainst : 0
  return pf - pa
}

function recordFromStanding(team: TeamStanding, kind: 'division' | 'conference'): WLT | null {
  const obj = team as unknown as Record<string, unknown>
  const w = safeNum(obj[`${kind}Wins`])
  const l = safeNum(obj[`${kind}Losses`])
  const t = safeNum(obj[`${kind}Ties`]) ?? 0
  if (w === null || l === null) return null
  return { w, l, t }
}

export class PlayoffSeedingService {
  // ✅ What the builders will call
  public computeSeeds(standings: TeamStanding[], games: GameWithTeams[]): SeededTeam[] {
    const seedMap = this.computePlayoffSeeds(standings, games)

    const seeded: SeededTeam[] = []
    for (const s of standings) {
      const seed = seedMap[s.teamId]
      if (typeof seed === 'number' && seed >= 1 && seed <= 7) {
        seeded.push({
          teamId: s.teamId,
          seed,
          isDivisionWinner: seed >= 1 && seed <= 4,
        })
      }
    }

    seeded.sort((a, b) => a.seed - b.seed)
    return seeded
  }

  // ✅ Canonical seed map (AFC+NFC together)
  public computePlayoffSeeds(standings: TeamStanding[], games: GameWithTeams[]): Record<number, number> {
    console.log('🔍 [PlayoffSeeding] ===== computePlayoffSeeds START =====')
    console.log('🔍 [PlayoffSeeding] Input:', standings.length, 'teams,', games.length, 'games')
    
    const finals = games.filter((g) => isFinal(g.gameStatus))
    console.log('🔍 [PlayoffSeeding] Filtered to', finals.length, 'final games')

    const byId = new Map<TeamId, TeamStanding>()
    for (const s of standings) byId.set(s.teamId, s)

    const confTeams = (conf: Conference): TeamStanding[] =>
      standings.filter((s) => norm(s.conference) === conf)

    const divisionTeams = (conf: Conference): Map<string, TeamStanding[]> => {
      const map = new Map<string, TeamStanding[]>()
      for (const s of confTeams(conf)) {
        const div = norm(s.division)
        const list = map.get(div) ?? []
        list.push(s)
        map.set(div, list)
      }
      return map
    }

    const opponentsByTeam = this.buildOpponentsMap(finals)

    const seeds: Record<number, number> = {}

    const pickDivisionWinners = (conf: Conference): TeamStanding[] => {
      const divMap = divisionTeams(conf)
      const winners: TeamStanding[] = []
      
      console.log(`🔍 [PlayoffSeeding] ${conf}: Found ${divMap.size} divisions`)
      
      // Validate we have exactly 4 divisions
      if (divMap.size !== 4) {
        console.warn(
          `[PlayoffSeeding] Expected 4 divisions in ${conf}, found ${divMap.size}:`,
          Array.from(divMap.keys())
        )
      }
      
      for (const [divName, teams] of divMap.entries()) {
        console.log(`🔍 [PlayoffSeeding] ${conf} ${divName}: ${teams.length} teams -`, 
          teams.map(t => `${t.teamId}:${t.wins}-${t.losses}`).join(', '))
        
        const ordered = this.orderDivision(teams, finals, byId, opponentsByTeam)
        if (ordered[0]) {
          console.log(`🔍 [PlayoffSeeding] ${conf} ${divName} winner: Team ${ordered[0].teamId} (${ordered[0].wins}-${ordered[0].losses})`)
          winners.push(ordered[0])
        } else {
          console.warn(`[PlayoffSeeding] No winner found for division: ${divName}`)
        }
      }
      
      console.log(`🔍 [PlayoffSeeding] ${conf} total division winners: ${winners.length}`)
      return winners
    }

    const afcWinners = pickDivisionWinners('AFC')
    const nfcWinners = pickDivisionWinners('NFC')
    
    console.log(`🔍 [PlayoffSeeding] AFC winners before ordering:`, afcWinners.map(t => t.teamId))
    console.log(`🔍 [PlayoffSeeding] NFC winners before ordering:`, nfcWinners.map(t => t.teamId))
    
    // Validate we have exactly 4 division winners per conference
    if (afcWinners.length !== 4) {
      console.warn(`[PlayoffSeeding] Expected 4 AFC division winners, found ${afcWinners.length}`)
    }
    if (nfcWinners.length !== 4) {
      console.warn(`[PlayoffSeeding] Expected 4 NFC division winners, found ${nfcWinners.length}`)
    }

    // ✅ FIX: Use proper division winner ordering (cross-division tiebreakers)
    const afcDivSeeded = this.orderDivisionWinners(afcWinners, finals, byId, opponentsByTeam)
    const nfcDivSeeded = this.orderDivisionWinners(nfcWinners, finals, byId, opponentsByTeam)

    console.log(`🔍 [PlayoffSeeding] AFC winners after ordering:`, afcDivSeeded.map(t => t.teamId))
    console.log(`🔍 [PlayoffSeeding] NFC winners after ordering:`, nfcDivSeeded.map(t => t.teamId))

    console.log('🔍 [PlayoffSeeding] Assigning seeds 1-4...')
    for (let i = 0; i < afcDivSeeded.length; i++) {
      const team = afcDivSeeded[i]
      seeds[team.teamId] = i + 1
      console.log(`🔍 [PlayoffSeeding] AFC Seed ${i + 1} → Team ${team.teamId}`)
    }
    
    for (let i = 0; i < nfcDivSeeded.length; i++) {
      const team = nfcDivSeeded[i]
      seeds[team.teamId] = i + 1
      console.log(`🔍 [PlayoffSeeding] NFC Seed ${i + 1} → Team ${team.teamId}`)
    }

    const pickWildCards = (conf: Conference, alreadyIn: Set<number>): TeamStanding[] => {
      const pool = confTeams(conf).filter((s) => !alreadyIn.has(s.teamId))
      const chosen: TeamStanding[] = []

      while (chosen.length < 3 && pool.length > 0) {
        const ordered = this.orderWildCard(pool, finals, byId, opponentsByTeam, 4)
        const best = ordered[0]
        if (!best) break
        chosen.push(best)
        const idx = pool.findIndex((x) => x.teamId === best.teamId)
        if (idx >= 0) pool.splice(idx, 1)
      }
      return chosen
    }

    const afcIn = new Set<number>(afcWinners.map((w) => w.teamId))
    const nfcIn = new Set<number>(nfcWinners.map((w) => w.teamId))

    const afcWc = pickWildCards('AFC', afcIn)
    const nfcWc = pickWildCards('NFC', nfcIn)

    for (let i = 0; i < afcWc.length; i++) seeds[afcWc[i].teamId] = 5 + i
    for (let i = 0; i < nfcWc.length; i++) seeds[nfcWc[i].teamId] = 5 + i

    console.log('🔍 [PlayoffSeeding] Final seeds:', seeds)
    console.log('🔍 [PlayoffSeeding] ===== computePlayoffSeeds END =====')
    return seeds
  }

  // ---------------- tie-break metrics ----------------

  private buildOpponentsMap(finals: GameWithTeams[]): Map<TeamId, Set<TeamId>> {
    const out = new Map<TeamId, Set<TeamId>>()
    const add = (a: TeamId, b: TeamId): void => {
      const set = out.get(a) ?? new Set<TeamId>()
      set.add(b)
      out.set(a, set)
    }

    for (const g of finals) {
      add(g.homeTeamId, g.awayTeamId)
      add(g.awayTeamId, g.homeTeamId)
    }
    return out
  }

  private headToHeadPct(a: TeamStanding, b: TeamStanding, finals: GameWithTeams[]): number {
    const r = this.recordVsOpponents(a.teamId, new Set([b.teamId]), finals)
    return pct(r)
  }

  // ✅ FIX: symmetric head-to-head so a loss doesn't look like "no difference"
  private headToHeadDelta(a: TeamStanding, b: TeamStanding, finals: GameWithTeams[]): number {
    return this.headToHeadPct(a, b, finals) - this.headToHeadPct(b, a, finals)
  }

  /**
   * ✅ NEW: For multi-team ties, calculate each team's record against ALL other tied teams
   * This is the correct NFL tiebreaker for 3+ team divisional ties
   */
  private headToHeadRecordInGroup(team: TeamStanding, group: TeamStanding[], finals: GameWithTeams[]): { w: number; l: number; t: number; pct: number } {
    const opponents = new Set(group.filter(t => t.teamId !== team.teamId).map(t => t.teamId))
    const record = this.recordVsOpponents(team.teamId, opponents, finals)
    return {
      w: record.w,
      l: record.l,
      t: record.t,
      pct: pct(record)
    }
  }

  private divisionRecordPct(team: TeamStanding, finals: GameWithTeams[], byId: Map<number, TeamStanding>): number {
    // TEMPORARY FIX: Always calculate from games because TeamStanding.divisionWins/Losses are incorrect
    // TODO: Fix ComputeStandingsService to populate divisionWins/divisionLosses correctly
    
    const div = norm(team.division)
    const conf = norm(team.conference)
    const opps = new Set<number>()
    for (const s of byId.values()) {
      if (norm(s.conference) !== conf) continue
      if (norm(s.division) !== div) continue
      if (s.teamId !== team.teamId) opps.add(s.teamId)
    }
    
    const record = this.recordVsOpponents(team.teamId, opps, finals)
    const pctValue = pct(record)
    console.log(`    [DivRecord] Team ${team.teamId}: Calculated ${record.w}-${record.l}-${record.t} = ${pctValue.toFixed(3)}`)
    return pctValue
  }

  private conferenceRecordPct(team: TeamStanding, finals: GameWithTeams[], byId: Map<number, TeamStanding>): number {
    // TEMPORARY FIX: Always calculate from games because TeamStanding.conferenceWins/Losses might be incorrect
    // TODO: Verify ComputeStandingsService populates conferenceWins/conferenceLosses correctly
    
    const conf = norm(team.conference)
    const opps = new Set<number>()
    for (const s of byId.values()) {
      if (norm(s.conference) !== conf) continue
      if (s.teamId !== team.teamId) opps.add(s.teamId)
    }
    return pct(this.recordVsOpponents(team.teamId, opps, finals))
  }

  private commonOpponentsPct(team: TeamStanding, commonOpps: Set<number>, finals: GameWithTeams[]): number {
    return pct(this.recordVsOpponents(team.teamId, commonOpps, finals))
  }

  private recordVsOpponents(teamId: number, opps: Set<number>, finals: GameWithTeams[]): WLT {
    const r: WLT = { w: 0, l: 0, t: 0 }
    if (opps.size === 0) return r

    for (const g of finals) {
      const isHome = g.homeTeamId === teamId
      const isAway = g.awayTeamId === teamId
      if (!isHome && !isAway) continue

      const oppId = isHome ? g.awayTeamId : g.homeTeamId
      if (!opps.has(oppId)) continue

      const hs = safeNum(g.homeScore) ?? 0
      const as = safeNum(g.awayScore) ?? 0
      const my = isHome ? hs : as
      const their = isHome ? as : hs

      if (my > their) r.w++
      else if (my < their) r.l++
      else r.t++
    }
    return r
  }

  private strengthOfSchedule(team: TeamStanding, finals: GameWithTeams[], byId: Map<number, TeamStanding>): number {
    const opps = this.opponentsForTeam(team.teamId, finals)
    if (opps.size === 0) return 0

    let sum = 0
    let n = 0
    for (const oppId of opps) {
      const opp = byId.get(oppId)
      if (!opp) continue
      sum += opp.winPct
      n++
    }
    return n === 0 ? 0 : sum / n
  }

  private strengthOfVictory(team: TeamStanding, finals: GameWithTeams[], byId: Map<number, TeamStanding>): number {
    // average winPct of opponents you BEAT (counting multiple wins)
    const beaten = new Map<number, number>()

    for (const g of finals) {
      const hs = safeNum(g.homeScore)
      const as = safeNum(g.awayScore)
      if (hs === null || as === null) continue

      if (g.homeTeamId === team.teamId && hs > as) {
        beaten.set(g.awayTeamId, (beaten.get(g.awayTeamId) ?? 0) + 1)
      }
      if (g.awayTeamId === team.teamId && as > hs) {
        beaten.set(g.homeTeamId, (beaten.get(g.homeTeamId) ?? 0) + 1)
      }
    }

    let sum = 0
    let n = 0
    for (const [oppId, count] of beaten.entries()) {
      const opp = byId.get(oppId)
      if (!opp) continue
      sum += opp.winPct * count
      n += count
    }
    return n === 0 ? 0 : sum / n
  }

  private opponentsForTeam(teamId: number, finals: GameWithTeams[]): Set<number> {
    const opps = new Set<number>()
    for (const g of finals) {
      if (g.homeTeamId === teamId) opps.add(g.awayTeamId)
      else if (g.awayTeamId === teamId) opps.add(g.homeTeamId)
    }
    return opps
  }

  private commonOpponentsForTeams(
    teams: TeamStanding[],
    opponentsByTeam: Map<number, Set<number>>,
    minCommon: number
  ): Set<number> | null {
    if (teams.length < 2) return null
    let common: Set<number> | null = null

    for (const t of teams) {
      const opps = opponentsByTeam.get(t.teamId) ?? new Set<number>()
      if (common === null) {
        common = new Set<number>(opps)
      } else {
        const next = new Set<number>()
        for (const id of common) {
          if (opps.has(id)) next.add(id)
        }
        common = next
      }
    }

    if (!common) return null
    return common.size >= minCommon ? common : null
  }

  // ---------------- ordering (division / wild card) ----------------

  private orderDivision(
    teams: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>
  ): TeamStanding[] {
    const grouped = this.groupByWinPct(teams)

    const out: TeamStanding[] = []
    for (const tieGroup of grouped) {
      if (tieGroup.length === 1) {
        out.push(tieGroup[0])
        continue
      }
      out.push(...this.breakTieDivision(tieGroup, finals, byId, opponentsByTeam))
    }
    return out
  }

  /**
   * ✅ NEW: Order division winners from different divisions (seeds 1-4)
   * Uses cross-division tiebreaking rules per NFL guidelines
   */
  private orderDivisionWinners(
    winners: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>
  ): TeamStanding[] {
    const grouped = this.groupByWinPct(winners)

    const out: TeamStanding[] = []
    for (const tieGroup of grouped) {
      if (tieGroup.length === 1) {
        out.push(tieGroup[0])
        continue
      }
      // Division winners use modified tiebreakers
      out.push(...this.breakTieDivisionWinners(tieGroup, finals, byId, opponentsByTeam))
    }
    return out
  }

  private orderWildCard(
    teams: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>,
    minCommon: number
  ): TeamStanding[] {
    const grouped = this.groupByWinPct(teams)

    const out: TeamStanding[] = []
    for (const tieGroup of grouped) {
      if (tieGroup.length === 1) {
        out.push(tieGroup[0])
        continue
      }
      out.push(...this.breakTieWildCard(tieGroup, finals, byId, opponentsByTeam, minCommon))
    }
    return out
  }

  private groupByWinPct(teams: TeamStanding[]): TeamStanding[][] {
    const sorted = [...teams].sort((a, b) => b.winPct - a.winPct)
    const out: TeamStanding[][] = []
    let i = 0
    while (i < sorted.length) {
      const cur = sorted[i]
      const group: TeamStanding[] = [cur]
      i++
      while (i < sorted.length && sorted[i].winPct === cur.winPct) {
        group.push(sorted[i])
        i++
      }
      out.push(group)
    }
    return out
  }

  private breakTieDivision(
    tied: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>
  ): TeamStanding[] {
    if (tied.length > 1) {
      console.log(`\n🔍 [Tiebreaker] Breaking tie for ${tied.length} teams:`, tied.map(t => `${t.teamId}(${t.wins}-${t.losses})`))
    }
    
    return this.breakTieGeneric(tied, [
      (a, b, group) => {
        // For 3+ team ties, use record against all tied teams
        if (group.length >= 3) {
          const aRecord = this.headToHeadRecordInGroup(a, group, finals)
          const bRecord = this.headToHeadRecordInGroup(b, group, finals)
          const delta = aRecord.pct - bRecord.pct
          if (delta !== 0) {
            console.log(`  H2H vs Tied Teams: ${a.teamId}=${aRecord.w}-${aRecord.l}-${aRecord.t} (${aRecord.pct.toFixed(3)}) vs ${b.teamId}=${bRecord.w}-${bRecord.l}-${bRecord.t} (${bRecord.pct.toFixed(3)}) = ${delta > 0 ? a.teamId : b.teamId}`)
          }
          return delta
        }
        // For 2-team ties, use pairwise head-to-head
        const delta = this.headToHeadDelta(a, b, finals)
        if (delta !== 0) {
          console.log(`  H2H: ${a.teamId} vs ${b.teamId} = ${delta > 0 ? a.teamId : b.teamId} wins`)
        }
        return delta
      },
      (a, b) => {
        const aPct = this.divisionRecordPct(a, finals, byId)
        const bPct = this.divisionRecordPct(b, finals, byId)
        const delta = aPct - bPct
        if (delta !== 0 && tied.length <= 3) {
          console.log(`  Div Record: ${a.teamId}=${aPct.toFixed(3)} vs ${b.teamId}=${bPct.toFixed(3)} = ${delta > 0 ? a.teamId : b.teamId}`)
        }
        return delta
      },
      (a, b, group) => {
        const common = this.commonOpponentsForTeams(group, opponentsByTeam, 0)
        if (!common) return 0
        const aPct = this.commonOpponentsPct(a, common, finals)
        const bPct = this.commonOpponentsPct(b, common, finals)
        const delta = aPct - bPct
        if (delta !== 0 && tied.length <= 3) {
          console.log(`  Common Opps (${common.size}): ${a.teamId}=${aPct.toFixed(3)} vs ${b.teamId}=${bPct.toFixed(3)} = ${delta > 0 ? a.teamId : b.teamId}`)
          console.log(`    Common opponent IDs:`, Array.from(common).sort((x, y) => x - y))
          
          // Show detailed records for debugging
          const aRecord = this.recordVsOpponents(a.teamId, common, finals)
          const bRecord = this.recordVsOpponents(b.teamId, common, finals)
          console.log(`    Team ${a.teamId} vs common: ${aRecord.w}-${aRecord.l}-${aRecord.t}`)
          console.log(`    Team ${b.teamId} vs common: ${bRecord.w}-${bRecord.l}-${bRecord.t}`)
        }
        return delta
      },
      (a, b) => {
        const aPct = this.conferenceRecordPct(a, finals, byId)
        const bPct = this.conferenceRecordPct(b, finals, byId)
        const delta = aPct - bPct
        if (tied.length <= 3) {
          console.log(`  Conf Record: ${a.teamId}=${aPct.toFixed(3)} vs ${b.teamId}=${bPct.toFixed(3)}${delta !== 0 ? ` = ${delta > 0 ? a.teamId : b.teamId}` : ' (tied)'}`)
        }
        return delta
      },
      (a, b) => {
        const aSoV = this.strengthOfVictory(a, finals, byId)
        const bSoV = this.strengthOfVictory(b, finals, byId)
        const delta = aSoV - bSoV
        if (tied.length <= 3) {
          console.log(`  Strength of Victory: ${a.teamId}=${aSoV.toFixed(3)} vs ${b.teamId}=${bSoV.toFixed(3)}${delta !== 0 ? ` = ${delta > 0 ? a.teamId : b.teamId}` : ' (tied)'}`)
        }
        return delta
      },
      (a, b) => {
        const aSoS = this.strengthOfSchedule(a, finals, byId)
        const bSoS = this.strengthOfSchedule(b, finals, byId)
        const delta = aSoS - bSoS
        if (tied.length <= 3) {
          console.log(`  Strength of Schedule: ${a.teamId}=${aSoS.toFixed(3)} vs ${b.teamId}=${bSoS.toFixed(3)}${delta !== 0 ? ` = ${delta > 0 ? a.teamId : b.teamId}` : ' (tied)'}`)
        }
        return delta
      },
      (a, b) => {
        const delta = pointDiff(a) - pointDiff(b)
        if (delta !== 0 && tied.length <= 3) {
          console.log(`  Point Diff: ${a.teamId}=${pointDiff(a)} vs ${b.teamId}=${pointDiff(b)} = ${delta > 0 ? a.teamId : b.teamId}`)
        }
        return delta
      },
    ])
  }

  /**
   * ✅ NEW: Tiebreaker for division winners from different divisions
   * Per NFL rules for seeding division winners 1-4
   */
  private breakTieDivisionWinners(
    tied: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>
  ): TeamStanding[] {
    return this.breakTieGeneric(tied, [
      (a, b) => this.headToHeadDelta(a, b, finals),
      (a, b) => this.conferenceRecordPct(a, finals, byId) - this.conferenceRecordPct(b, finals, byId),
      (a, b, group) => {
        const common = this.commonOpponentsForTeams(group, opponentsByTeam, 4)
        if (!common) return 0
        return this.commonOpponentsPct(a, common, finals) - this.commonOpponentsPct(b, common, finals)
      },
      (a, b) => this.strengthOfVictory(a, finals, byId) - this.strengthOfVictory(b, finals, byId),
      (a, b) => this.strengthOfSchedule(a, finals, byId) - this.strengthOfSchedule(b, finals, byId),
      (a, b) => pointDiff(a) - pointDiff(b),
    ])
  }

  private breakTieWildCard(
    tied: TeamStanding[],
    finals: GameWithTeams[],
    byId: Map<number, TeamStanding>,
    opponentsByTeam: Map<number, Set<number>>,
    minCommon: number
  ): TeamStanding[] {
    return this.breakTieGeneric(tied, [
      (a, b) => this.headToHeadDelta(a, b, finals),
      (a, b) => this.conferenceRecordPct(a, finals, byId) - this.conferenceRecordPct(b, finals, byId),
      (a, b, group) => {
        const common = this.commonOpponentsForTeams(group, opponentsByTeam, minCommon)
        if (!common) return 0
        return this.commonOpponentsPct(a, common, finals) - this.commonOpponentsPct(b, common, finals)
      },
      (a, b) => this.strengthOfVictory(a, finals, byId) - this.strengthOfVictory(b, finals, byId),
      (a, b) => this.strengthOfSchedule(a, finals, byId) - this.strengthOfSchedule(b, finals, byId),
      (a, b) => pointDiff(a) - pointDiff(b),
    ])
  }

  private breakTieGeneric(
    tied: TeamStanding[],
    metrics: Array<(a: TeamStanding, b: TeamStanding, group: TeamStanding[]) => number>
  ): TeamStanding[] {
    const group = [...tied]

    group.sort((a, b) => {
      for (const m of metrics) {
        const delta = m(a, b, group)
        if (delta !== 0) return delta > 0 ? -1 : 1
      }
      return a.teamId - b.teamId
    })

    return group
  }
}