
// draftproanalytics-server/src/application/standings/services/StandingService.ts
import { ITeamStandingsRepository } from '@/domain/standings/repositories/ITeamStandingsRepository';
import { TeamStanding } from '@/domain/standings/interface/TeamStanding';
import { EspnStandingsClient } from '@/espn/EspnStandingsClient';


function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export class StandingsService {
  private readonly espn = new EspnStandingsClient()

  constructor(private repo: ITeamStandingsRepository) {}

  async getStandings(year: number, seasonType: number): Promise<TeamStanding[]> {
    const rows = await this.repo.computeStandings(year, seasonType)

    // ✅ use ESPN to enrich playoff seeds (use regular season standings = seasonType 2)
    const seedsByName = await this.espn.getPlayoffSeedsByTeamName(year, 2)
    console.log('[standings] ESPN seeds sample:', Object.entries(seedsByName).slice(0, 10))
    console.log('[standings] ESPN seed for Buffalo Bills:', seedsByName['buffalo bills'])

    for (const r of rows) {
      const key = normalizeName(r.teamName)
      r.playoffSeed = seedsByName[key] ?? null
    }

    return rows
  }
}
