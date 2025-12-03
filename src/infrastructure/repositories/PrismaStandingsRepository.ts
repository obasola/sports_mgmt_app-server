import { PrismaClient, Game_gameStatus } from '@prisma/client'
import { ITeamStandingsRepository } from '@/domain/standings/repositories/ITeamStandingsRepository'
import { TeamStanding } from '@/domain/standings/interface/TeamStanding'
import { GameProps } from '@/domain/game/entities/Game' // or wherever you define your GameProps

export class PrismaStandingsRepository implements ITeamStandingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getCompletedGames(year: number, seasonType: number): Promise<GameProps[]> {
    
    return this.prisma.game.findMany({
      where: {
        seasonYear: String(year),
        seasonType,
        gameStatus: Game_gameStatus.final,
        //seasonType
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    }) as unknown as GameProps[]
  }

  async computeStandings(year: number, seasonType: number): Promise<TeamStanding[]> {
    const games = await this.getCompletedGames(year, seasonType)
    console.log("[PrismaStandingsRepo::computeStandings] Bbr games found: "+games.length)
    const standings: Record<number, TeamStanding> = {}

    const ensureTeam = (team: any) => {
      if (!standings[team.id]) {
        standings[team.id] = {
          teamId: team.id,
          teamName: team.name,
          conference: team.conference,
          division: team.division,
          wins: 0,
          losses: 0,
          ties: 0,
          winPct: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          streak: '',
          divisionWins: 0,
          divisionLosses: 0,
          conferenceWins: 0,
          conferenceLosses: 0
        }
      }
    }

    for (const g of games) {
      const { homeTeam, awayTeam, homeScore, awayScore } = g

      if (!homeTeam || !awayTeam) continue

      ensureTeam(homeTeam)
      ensureTeam(awayTeam)

      // update points
      standings[homeTeam.id].pointsFor += homeScore ?? 0
      standings[homeTeam.id].pointsAgainst += awayScore ?? 0
      standings[awayTeam.id].pointsFor += awayScore ?? 0
      standings[awayTeam.id].pointsAgainst += homeScore ?? 0

      // update win/loss/tie
      if (homeScore! > awayScore!) {
        standings[homeTeam.id].wins++
        standings[awayTeam.id].losses++
      } else if (awayScore! > homeScore!) {
        standings[awayTeam.id].wins++
        standings[homeTeam.id].losses++
      } else {
        standings[homeTeam.id].ties++
        standings[awayTeam.id].ties++
      }

      // Division & conference breakdowns (optional)
      if (homeTeam.division === awayTeam.division) {
        if (homeScore! > awayScore!) standings[homeTeam.id].divisionWins++
        else if (awayScore! > homeScore!) standings[awayTeam.id].divisionWins++
        else {
          standings[homeTeam.id].divisionLosses++
          standings[awayTeam.id].divisionLosses++
        }
      }

      if (homeTeam.conference === awayTeam.conference) {
        if (homeScore! > awayScore!) standings[homeTeam.id].conferenceWins++
        else if (awayScore! > homeScore!) standings[awayTeam.id].conferenceWins++
        else {
          standings[homeTeam.id].conferenceLosses++
          standings[awayTeam.id].conferenceLosses++
        }
      }
    }

    // finalize pct calculation
    for (const s of Object.values(standings)) {
      const totalGames = s.wins + s.losses + s.ties
      s.winPct = totalGames > 0 ? Number(((s.wins + 0.5 * s.ties) / totalGames).toFixed(3)) : 0
    }

    return Object.values(standings)
  }
}
