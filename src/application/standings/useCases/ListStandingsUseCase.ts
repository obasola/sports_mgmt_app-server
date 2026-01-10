import { PlayoffSeedingService } from '@/application/standings/services/PlayoffSeedingService'
import { ITeamStandingsRepository } from '@/domain/standings/repositories/ITeamStandingsRepository'
import { ComputeStandingsService } from '../services/ComputeStandingsService'

export class ListStandingsUseCase {
  constructor(
    private repo: ITeamStandingsRepository,
    private computeSvc: ComputeStandingsService,
    private seeding: PlayoffSeedingService,
  ) {}

  async execute(year: number, seasonType: number) {
    const games = await this.repo.getCompletedGames(year, seasonType)
    const standings = this.computeSvc.compute(games)

    const seedMap = this.seeding.computePlayoffSeeds(standings, games)
    for (const s of standings) {
      const seed = seedMap[s.teamId]
      s.playoffSeed = typeof seed === 'number' ? seed : 0
    }
    return standings
  }
}
