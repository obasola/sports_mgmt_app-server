import { TeamStanding } from '@/domain/standings/entities/TeamStanding'

export interface TeamInfo {
  id: number
  name: string
  conference: string
  division: string
}

export interface GameWithTeams {
  id: number
  seasonYear: string
  gameWeek?: number
  preseason?: number
  gameDate?: Date
  homeTeamId: number
  awayTeamId: number
  homeScore?: number
  awayScore?: number
  gameStatus: string
  homeTeam: TeamInfo
  awayTeam: TeamInfo
}

export class ComputeStandingsService {
  compute(games: GameWithTeams[]): TeamStanding[] {
    const map = new Map<number, TeamStanding>()

    try {
      for (const g of games) {
        const homeTeam = g.homeTeam
        const awayTeam = g.awayTeam
        if (!homeTeam || !awayTeam) continue

        const home =
          map.get(homeTeam.id) ??
          new TeamStanding(
            homeTeam.id,
            homeTeam.name,
            homeTeam.division,
            homeTeam.conference,
            0, 0, 0, 0, 0, '', 0, 0, 0, 0
          )

        const away =
          map.get(awayTeam.id) ??
          new TeamStanding(
            awayTeam.id,
            awayTeam.name,
            awayTeam.division,
            awayTeam.conference,
            0, 0, 0, 0, 0, '', 0, 0, 0, 0
          )

        const homeScore = g.homeScore ?? 0
        const awayScore = g.awayScore ?? 0

        // Skip incomplete games
        if (g.gameStatus !== 'completed') continue

        home.pointsFor += homeScore
        home.pointsAgainst += awayScore
        away.pointsFor += awayScore
        away.pointsAgainst += homeScore

        const sameDivision = homeTeam.division === awayTeam.division
        const sameConference = homeTeam.conference === awayTeam.conference

        if (homeScore > awayScore) {
          home.wins++
          away.losses++
          if (sameDivision) {
            home.divisionWins++
            away.divisionLosses++
          }
          if (sameConference) {
            home.conferenceWins++
            away.conferenceLosses++
          }
        } else if (awayScore > homeScore) {
          away.wins++
          home.losses++
          if (sameDivision) {
            away.divisionWins++
            home.divisionLosses++
          }
          if (sameConference) {
            away.conferenceWins++
            home.conferenceLosses++
          }
        } else {
          home.ties++
          away.ties++
        }

        map.set(home.teamId, home)
        map.set(away.teamId, away)
      }

      // ✅ Always return array
      return Array.from(map.values())
    } catch (err) {
      console.error('ComputeStandingsService.compute() failed:', err)
      // Return empty array on failure to satisfy signature
      return []
    }
  }
}
