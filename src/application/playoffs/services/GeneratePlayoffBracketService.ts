// src/application/playoffs/services/GeneratePlayoffBracketService.ts

import type { PlayoffBracket } from "@/domain/playoffs/valueObjects/PlayoffBracket";
import type { PlayoffBracketService } from "./PlayoffBracketService";
import type {
  IGameRepository,
  PlayoffGameSummary,
} from "@/domain/game/repositories/IGameRepository";
import type { ITeamStandingsRepository } from "@/domain/standings/repositories/ITeamStandingsRepository";
import type { TeamStanding } from "@/domain/standings/interface/TeamStanding";

import { PlayoffSeedingService } from "./PlayoffSeedingService";
import { ActualBracketBuilder } from "./builders/ActualBracketBuilder";
import { ProjectedBracketBuilder } from "./builders/ProjectedBracketBuilder";

export class GeneratePlayoffBracketService implements PlayoffBracketService {
  private readonly actualBuilder: ActualBracketBuilder;
  private readonly projectedBuilder: ProjectedBracketBuilder;

  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly standingsRepository: ITeamStandingsRepository,
    private readonly seedingService: PlayoffSeedingService
  ) {
    this.actualBuilder = new ActualBracketBuilder(
      this.gameRepository,
      this.seedingService
    );
    this.projectedBuilder = new ProjectedBracketBuilder(this.seedingService);
  }

  public async getBracketForSeason(
    seasonYear: number,
    mode?: "actual" | "projected"
  ): Promise<PlayoffBracket> {
    const effectiveMode: "actual" | "projected" = mode ?? "actual";
    const SEASON_TYPE_REGULAR = 2;

    const allStandings: TeamStanding[] =
      await this.standingsRepository.computeStandings(
        seasonYear,
        SEASON_TYPE_REGULAR
      );

    if (effectiveMode === "projected") {
      // Purely simulated “if playoffs started today”
      return this.projectedBuilder.build(seasonYear, allStandings);
    }

    // Actual bracket view: use any existing playoff games, fill gaps with projections
    const playoffGames: PlayoffGameSummary[] =
      await this.gameRepository.findPlayoffGamesBySeason(seasonYear);

    return this.actualBuilder.build(seasonYear, allStandings, playoffGames);
  }
}
