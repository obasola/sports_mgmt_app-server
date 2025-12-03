// src/domain/repositories/ITeamStandingsRepository.ts
import { TeamStanding } from "../interface/TeamStanding";

export interface ITeamStandingsRepository {
  getCompletedGames(year: number, seasonType: number): Promise<any[]>;
  computeStandings(year: number, seasonType: number): Promise<TeamStanding[]>;
}

