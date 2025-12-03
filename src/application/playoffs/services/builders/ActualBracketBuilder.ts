// src/application/playoffs/services/builders/ActualBracketBuilder.ts

import type {
  PlayoffBracket,
  PlayoffRoundGroup,
} from "@/domain/playoffs/valueObjects/PlayoffBracket";
import type {
  PlayoffMatchup,
  PlayoffConference,
  PlayoffRound,
} from "@/domain/playoffs/valueObjects/PlayoffTypes";
import type {
  PlayoffGameSummary,
  IGameRepository,
} from "@/domain/game/repositories/IGameRepository";
import type { TeamStanding } from "@/domain/standings/interface/TeamStanding";
import type { SeededTeam } from "../PlayoffSeedingService";
import { PlayoffSeedingService } from "../PlayoffSeedingService";

export class ActualBracketBuilder {
  constructor(
    // Kept for future use if you later want to pull data here directly
    private readonly gameRepo: IGameRepository,
    private readonly seeding: PlayoffSeedingService
  ) {}

  public build(
    seasonYear: number,
    allStandings: TeamStanding[],
    playoffGames: PlayoffGameSummary[]
  ): PlayoffBracket {
    const afc = allStandings.filter((t) => t.conference === "AFC");
    const nfc = allStandings.filter((t) => t.conference === "NFC");

    const afcSeeds = this.seeding.computeSeeds(afc);
    const nfcSeeds = this.seeding.computeSeeds(nfc);

    const afcRounds = this.buildConference(
      "AFC",
      seasonYear,
      afcSeeds,
      playoffGames
    );
    const nfcRounds = this.buildConference(
      "NFC",
      seasonYear,
      nfcSeeds,
      playoffGames
    );

    const superBowl = this.buildSuperBowl(seasonYear, playoffGames);

    return {
      seasonYear,
      afcRounds,
      nfcRounds,
      superBowl,
    };
  }

  private buildConference(
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[],
    games: PlayoffGameSummary[]
  ): PlayoffRoundGroup[] {
    const wildcard = this.buildRound(
      "WILDCARD",
      conference,
      seasonYear,
      seeds,
      games
    );
    const divisional = this.buildRound(
      "DIVISIONAL",
      conference,
      seasonYear,
      seeds,
      games
    );
    const conf = this.buildRound(
      "CONFERENCE",
      conference,
      seasonYear,
      seeds,
      games
    );

    return [wildcard, divisional, conf];
  }

  private buildRound(
    round: Extract<PlayoffRound, "WILDCARD" | "DIVISIONAL" | "CONFERENCE">,
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[],
    games: PlayoffGameSummary[]
  ): PlayoffRoundGroup {
    const existing = games.filter(
      (g) =>
        g.seasonYear === seasonYear &&
        g.playoffConference === conference &&
        g.playoffRound === round
    );

    const matchups: PlayoffMatchup[] =
      existing.length > 0
        ? existing.map((g, index) => ({
            gameId: g.id,
            seasonYear,
            round,
            conference,
            slot: `${conference}_${round}_${index + 1}`,
            homeTeamId: g.homeTeamId,
            awayTeamId: g.awayTeamId,
            homeSeed: g.homeSeed,
            awaySeed: g.awaySeed,
            homeScore: g.homeScore,
            awayScore: g.awayScore,
            winnerTeamId: this.winner(
              g.homeTeamId,
              g.awayTeamId,
              g.homeScore,
              g.awayScore
            ),
            gameDate: g.gameDate,
          }))
        : this.projectWildcardIfMissing(round, conference, seasonYear, seeds);

    return {
      round,
      conference,
      matchups,
    };
  }

  private projectWildcardIfMissing(
    round: PlayoffRound,
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[]
  ): PlayoffMatchup[] {
    if (round !== "WILDCARD") {
      return [];
    }

    const pairs: Array<[number, number]> = [
      [2, 7],
      [3, 6],
      [4, 5],
    ];

    return pairs.map(([homeSeedNum, awaySeedNum]) => {
      const home = seeds.find((s) => s.seed === homeSeedNum);
      const away = seeds.find((s) => s.seed === awaySeedNum);

      return {
        gameId: null,
        seasonYear,
        round: "WILDCARD" as const,
        conference,
        slot: `${conference}_WILDCARD_${homeSeedNum}v${awaySeedNum}`,
        homeTeamId: home?.teamId ?? null,
        awayTeamId: away?.teamId ?? null,
        homeSeed: home?.seed ?? null,
        awaySeed: away?.seed ?? null,
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        gameDate: null,
      };
    });
  }

  private buildSuperBowl(
    seasonYear: number,
    games: PlayoffGameSummary[]
  ): PlayoffMatchup | null {
    const sb = games.find(
      (g) => g.seasonYear === seasonYear && g.playoffRound === "SUPERBOWL"
    );
    if (!sb) {
      return null;
    }

    return {
      gameId: sb.id,
      seasonYear,
      round: "SUPERBOWL",
      conference: "AFC",
      slot: "SUPERBOWL",
      homeTeamId: sb.homeTeamId,
      awayTeamId: sb.awayTeamId,
      homeSeed: sb.homeSeed,
      awaySeed: sb.awaySeed,
      homeScore: sb.homeScore,
      awayScore: sb.awayScore,
      winnerTeamId: this.winner(
        sb.homeTeamId,
        sb.awayTeamId,
        sb.homeScore,
        sb.awayScore
      ),
      gameDate: sb.gameDate,
    };
  }

  private winner(
    homeTeamId: number,
    awayTeamId: number,
    homeScore: number | null,
    awayScore: number | null
  ): number | null {
    if (homeScore == null || awayScore == null) {
      return null;
    }
    if (homeScore > awayScore) {
      return homeTeamId;
    }
    if (awayScore > homeScore) {
      return awayTeamId;
    }
    return null;
  }
}
