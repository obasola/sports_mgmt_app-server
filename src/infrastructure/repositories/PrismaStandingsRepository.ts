// draftproanalytics-server/src/infrastructure/repositories/PrismaStandingsRepository.ts
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

      // Division & conference breakdowns
      // Normalize for case-insensitive comparison
      const norm = (v: string | undefined | null): string => 
        String(v ?? '').trim().toUpperCase()
      
      const sameDivision = norm(homeTeam.division) === norm(awayTeam.division)
      const sameConference = norm(homeTeam.conference) === norm(awayTeam.conference)

      // Debug logging for NFC South games
      if ((homeTeam.id === 62 || homeTeam.id === 66 || homeTeam.id === 88 || homeTeam.id === 92) &&
          (awayTeam.id === 62 || awayTeam.id === 66 || awayTeam.id === 88 || awayTeam.id === 92)) {
        console.log(`[PrismaStandingsRepo] NFC South: ${homeTeam.name} (div="${homeTeam.division}") vs ${awayTeam.name} (div="${awayTeam.division}") - sameDivision: ${sameDivision}, score: ${homeScore}-${awayScore}`)
      }

      if (sameDivision) {
        if (homeScore! > awayScore!) {
          standings[homeTeam.id].divisionWins++
          standings[awayTeam.id].divisionLosses++
        } else if (awayScore! > homeScore!) {
          standings[awayTeam.id].divisionWins++
          standings[homeTeam.id].divisionLosses++
        }
        // Ties don't increment wins or losses
      }

      if (sameConference) {
        if (homeScore! > awayScore!) {
          standings[homeTeam.id].conferenceWins++
          standings[awayTeam.id].conferenceLosses++
        } else if (awayScore! > homeScore!) {
          standings[awayTeam.id].conferenceWins++
          standings[homeTeam.id].conferenceLosses++
        }
        // Ties don't increment wins or losses
      }
    }

    // finalize pct calculation
    for (const s of Object.values(standings)) {
      const totalGames = s.wins + s.losses + s.ties
      s.winPct = totalGames > 0 ? Number(((s.wins + 0.5 * s.ties) / totalGames).toFixed(3)) : 0
    }

    // Debug: Show NFC South final division records
    const nfcSouth = [62, 66, 88, 92]
    console.log('\n[PrismaStandingsRepo] NFC South Final Division Records:')
    for (const teamId of nfcSouth) {
      const s = standings[teamId]
      if (s) {
        console.log(`  ${s.teamName}: ${s.divisionWins}-${s.divisionLosses} (overall: ${s.wins}-${s.losses}-${s.ties})`)
      }
    }

    return Object.values(standings)
  }
}