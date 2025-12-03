// src/application/playoffs/services/builders/ProjectedBracketBuilder.ts

import type { PlayoffBracket, PlayoffRoundGroup } from "@/domain/playoffs/valueObjects/PlayoffBracket";
import type { PlayoffMatchup, PlayoffConference, PlayoffRound } from "@/domain/playoffs/valueObjects/PlayoffTypes";
import type { TeamStanding } from "@/domain/standings/interface/TeamStanding";
import type { SeededTeam } from "../PlayoffSeedingService";

import { PlayoffSeedingService } from "../PlayoffSeedingService";

export class ProjectedBracketBuilder {
  constructor(private readonly seeding: PlayoffSeedingService) {}

  public build(seasonYear: number, allStandings: TeamStanding[]): PlayoffBracket {
    const afc = allStandings.filter((t) => t.conference === "AFC");
    const nfc = allStandings.filter((t) => t.conference === "NFC");

    const afcSeeds = this.seeding.computeSeeds(afc);
    const nfcSeeds = this.seeding.computeSeeds(nfc);

    const afcRounds = this.projectConference(seasonYear, "AFC", afcSeeds);
    const nfcRounds = this.projectConference(seasonYear, "NFC", nfcSeeds);

    return {
      seasonYear,
      afcRounds,
      nfcRounds,
      superBowl: null,
    };
  }

  private projectConference(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[]
  ): PlayoffRoundGroup[] {
    const wc = this.projectWildCard(seasonYear, conference, seeds);
    const wcWinners = wc.matchups.map((m) => this.pickWinner(m));

    const div = this.projectDivisional(seasonYear, conference, seeds, wcWinners);
    const divWinners = div.matchups.map((m) => this.pickWinner(m));

    const conf = this.projectConferenceChamp(seasonYear, conference, divWinners);

    return [wc, div, conf];
  }

  private projectWildCard(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[]
  ): PlayoffRoundGroup {
    const round: PlayoffRound = "WILDCARD";

    const matchups: PlayoffMatchup[] = [
      { home: 2, away: 7, slot: "2v7" },
      { home: 3, away: 6, slot: "3v6" },
      { home: 4, away: 5, slot: "4v5" },
    ].map((p) => {
      const home = seeds.find((s) => s.seed === p.home)!;
      const away = seeds.find((s) => s.seed === p.away)!;

      return {
        gameId: null,
        seasonYear,
        round,
        conference,
        slot: `${conference}_WC_${p.slot}`,
        homeTeamId: home.teamId,
        awayTeamId: away.teamId,
        homeSeed: home.seed,
        awaySeed: away.seed,
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        gameDate: null,
      };
    });

    return { round, conference, matchups };
  }

  private projectDivisional(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[],
    wcWinners: number[]
  ): PlayoffRoundGroup {
    const round: PlayoffRound = "DIVISIONAL";

    const oneSeed = seeds.find((s) => s.seed === 1)!;

    const sorted = [...wcWinners].sort((a, b) => {
      const aSeed = seeds.find((s) => s.teamId === a)!.seed;
      const bSeed = seeds.find((s) => s.teamId === b)!.seed;
      return aSeed - bSeed;
    });

    const lowest = sorted[0];
    const mid = sorted[1];
    const highest = sorted[2];

    const m1: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round,
      conference,
      slot: `${conference}_DIV_1`,
      homeTeamId: oneSeed.teamId,
      awayTeamId: lowest,
      homeSeed: oneSeed.seed,
      awaySeed: seeds.find((s) => s.teamId === lowest)!.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    const m2: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round,
      conference,
      slot: `${conference}_DIV_2`,
      homeTeamId: mid,
      awayTeamId: highest,
      homeSeed: seeds.find((s) => s.teamId === mid)!.seed,
      awaySeed: seeds.find((s) => s.teamId === highest)!.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    return { round, conference, matchups: [m1, m2] };
  }

  private projectConferenceChamp(
    seasonYear: number,
    conference: PlayoffConference,
    winners: number[]
  ): PlayoffRoundGroup {
    const round: PlayoffRound = "CONFERENCE";

    const match: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round,
      conference,
      slot: `${conference}_CONF_1`,
      homeTeamId: winners[0],
      awayTeamId: winners[1],
      homeSeed: null,
      awaySeed: null,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    return { round, conference, matchups: [match] };
  }

  private pickWinner(game: PlayoffMatchup): number {
    return (game.homeSeed ?? 99) < (game.awaySeed ?? 99)
      ? game.homeTeamId!
      : game.awayTeamId!;
  }
}
