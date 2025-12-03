
// src/application/standings/services/StandingService.ts
import { ITeamStandingsRepository } from '@/domain/standings/repositories/ITeamStandingsRepository';
import { TeamStanding } from '@/domain/standings/interface/TeamStanding';

export class StandingsService {
  constructor(private repo: ITeamStandingsRepository) {}

  async getStandings(year: number, seasonType: number): Promise<TeamStanding[]> {
    return this.repo.computeStandings(year, seasonType);
  }
}
