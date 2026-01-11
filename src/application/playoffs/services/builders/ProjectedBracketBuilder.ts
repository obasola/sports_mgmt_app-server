// src/application/playoffs/services/builders/ProjectedBracketBuilder.ts
import type { PlayoffBracket, PlayoffRoundGroup } from '@/domain/playoffs/valueObjects/PlayoffBracket'
import type { PlayoffMatchup, PlayoffConference } from '@/domain/playoffs/valueObjects/PlayoffTypes'
import type { IGameRepository } from '@/domain/game/repositories/IGameRepository'
import type { TeamStanding } from '@/domain/standings/interface/TeamStanding'
import type { GameWithTeams } from '@/application/standings/services/ComputeStandingsService'
import { PlayoffSeedingService, SeededTeam } from '@/application/standings/services/PlayoffSeedingService'
import { buildGamesWithTeams } from '@/application/standings/util/buildGamesWithTeams'

const norm = (v: unknown): string => String(v ?? '').trim().toUpperCase()



export class ProjectedBracketBuilder {
  constructor(
    private readonly gameRepo: IGameRepository,
    private readonly seeding: PlayoffSeedingService
  ) {}

  public async build(seasonYear: number, allStandings: TeamStanding[]): Promise<PlayoffBracket> {
    const regularSeasonGames = await this.gameRepo.findRegularSeasonGames(undefined, String(seasonYear))
    const gamesWithTeams = buildGamesWithTeams({
      games: regularSeasonGames,
      standings: allStandings,
      
      seasonYear,
    });
    

    const afc = allStandings.filter((t) => norm(t.conference) === 'AFC')
    const nfc = allStandings.filter((t) => norm(t.conference) === 'NFC')

    const afcSeeds = this.seeding.computeSeeds(afc, gamesWithTeams)
    const nfcSeeds = this.seeding.computeSeeds(nfc, gamesWithTeams)

    const afcRounds = this.projectConference(seasonYear, 'AFC', afcSeeds)
    const nfcRounds = this.projectConference(seasonYear, 'NFC', nfcSeeds)

    return { seasonYear, afcRounds, nfcRounds, superBowl: null }
  }

  private projectConference(seasonYear: number, conference: PlayoffConference, seeds: SeededTeam[]): PlayoffRoundGroup[] {
    const wc = this.projectWildCard(seasonYear, conference, seeds)
    const wcWinners = wc.matchups.map((g) => this.pickWinner(g))

    const div = this.projectDivisional(seasonYear, conference, seeds, wcWinners)
    const divWinners = div.matchups.map((g) => this.pickWinner(g))

    const conf = this.projectConferenceChamp(seasonYear, conference, divWinners)

    return [wc, div, conf]
  }

  private projectWildCard(seasonYear: number, conference: PlayoffConference, seeds: SeededTeam[]): PlayoffRoundGroup {
    const pairs = [
      { slot: '2v7', home: 2, away: 7 },
      { slot: '3v6', home: 3, away: 6 },
      { slot: '4v5', home: 4, away: 5 },
    ]

    const matchups: PlayoffMatchup[] = pairs.map((p) => {
      const home = seeds.find((s) => s.seed === p.home)
      const away = seeds.find((s) => s.seed === p.away)
      if (!home || !away) {
        throw new Error(`ProjectedBracketBuilder: missing seed(s) for ${conference} ${p.slot}`)
      }

      return {
        gameId: null,
        seasonYear,
        round: 'WILDCARD',
        conference,
        slot: `${conference}_WC_${p.slot}`,
        homeTeamId: home.teamId,
        awayTeamId: away.teamId,
        homeSeed: home.seed,
        awaySeed: away.seed,
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        gameDate: null,
      }
    })

    return { round: 'WILDCARD', conference, matchups }
  }

  private projectDivisional(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[],
    wcWinners: number[]
  ): PlayoffRoundGroup {
    const oneSeed = seeds.find((s) => s.seed === 1)
    if (!oneSeed) {
      return { round: 'DIVISIONAL', conference, matchups: [] }
    }

    const winnersWithSeeds: SeededTeam[] = wcWinners
      .map((teamId) => {
        const info = seeds.find((s) => s.teamId === teamId)
        if (!info) throw new Error(`ProjectedBracketBuilder: missing seed info for teamId=${teamId}`)
        return info
      })
      .sort((a, b) => a.seed - b.seed)

    if (winnersWithSeeds.length !== 3) return { round: 'DIVISIONAL', conference, matchups: [] }

    const best = winnersWithSeeds[0]
    const middle = winnersWithSeeds[1]
    const worst = winnersWithSeeds[2]

    const m1: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'DIVISIONAL',
      conference,
      slot: `${conference}_DIV_1`,
      homeTeamId: oneSeed.teamId,
      awayTeamId: worst.teamId,
      homeSeed: oneSeed.seed,
      awaySeed: worst.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    }

    const m2: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'DIVISIONAL',
      conference,
      slot: `${conference}_DIV_2`,
      homeTeamId: best.teamId,
      awayTeamId: middle.teamId,
      homeSeed: best.seed,
      awaySeed: middle.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    }

    return { round: 'DIVISIONAL', conference, matchups: [m1, m2] }
  }

  private projectConferenceChamp(seasonYear: number, conference: PlayoffConference, divWinners: number[]): PlayoffRoundGroup {
    if (divWinners.length !== 2) return { round: 'CONFERENCE', conference, matchups: [] }

    const m: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'CONFERENCE',
      conference,
      slot: `${conference}_CONF`,
      homeTeamId: divWinners[0],
      awayTeamId: divWinners[1],
      homeSeed: null,
      awaySeed: null,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    }

    return { round: 'CONFERENCE', conference, matchups: [m] }
  }

  private pickWinner(g: PlayoffMatchup): number {
    // Simple projection: lower seed number wins; if missing seed, home wins.
    if (typeof g.homeSeed === 'number' && typeof g.awaySeed === 'number') {
      return g.homeSeed <= g.awaySeed ? g.homeTeamId ?? 0 : g.awayTeamId ?? 0
    }
    return g.homeTeamId ?? 0
  }
}
