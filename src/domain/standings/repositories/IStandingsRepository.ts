export interface IStandingsRepository {
  getCompletedGames(year: number, seasonType: number): Promise<any[]>;
}

