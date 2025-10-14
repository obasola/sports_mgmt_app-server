import { IStandingsRepository } from '@/domain/standings/repositories/IStandingsRepository';
import { ComputeStandingsService } from '../services/ComputeStandingsService';

export class ListStandingsUseCase {
  constructor(private repo: IStandingsRepository, private computeSvc: ComputeStandingsService) {}

  async execute(year: number, seasonType: number) {
    const games = await this.repo.getCompletedGames(year, seasonType);
    return this.computeSvc.compute(games);
  }
}

