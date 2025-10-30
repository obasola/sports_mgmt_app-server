import { TeamStanding } from "../interface/TeamStanding";

export interface IStandingsRepository {
  getCompletedGames(year: number, seasonType: number): Promise<any[]>;
  computeStandings(year: number, seasonType: number): Promise<TeamStanding[]>;
}

