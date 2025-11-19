
// src/application/standings/services/StandingService.ts
import { IStandingsRepository } from '@/domain/standings/repositories/IStandingsRepository';
import { TeamStanding } from '@/domain/standings/interface/TeamStanding';

export class StandingsService {
  constructor(private repo: IStandingsRepository) {}

  async getStandings(year: number, seasonType: number): Promise<TeamStanding[]> {
    return this.repo.computeStandings(year, seasonType);
  }
}
