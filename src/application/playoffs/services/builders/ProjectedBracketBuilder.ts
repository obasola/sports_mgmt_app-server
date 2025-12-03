// src/application/playoffs/services/builders/ProjectedBracketBuilder.ts
import type {
  PlayoffBracket,
  PlayoffRoundGroup,
} from '@/domain/playoffs/valueObjects/PlayoffBracket';
import type {
  PlayoffMatchup,
  PlayoffConference,
} from '@/domain/playoffs/valueObjects/PlayoffTypes';
import type { TeamStanding } from '@/domain/standings/interface/TeamStanding';
import type { SeededTeam } from '../PlayoffSeedingService';
import { PlayoffSeedingService } from '../PlayoffSeedingService';

export class ProjectedBracketBuilder {
  constructor(private readonly seeding: PlayoffSeedingService) {}

  public build(seasonYear: number, allStandings: TeamStanding[]): PlayoffBracket {
    const afc = allStandings.filter((t) => t.conference === 'AFC');
    const nfc = allStandings.filter((t) => t.conference === 'NFC');

    const afcSeeds = this.seeding.computeSeeds(afc);
    const nfcSeeds = this.seeding.computeSeeds(nfc);

    const afcRounds = this.projectConference(seasonYear, 'AFC', afcSeeds);
    const nfcRounds = this.projectConference(seasonYear, 'NFC', nfcSeeds);

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

    const wcWinners = wc.matchups.map((g) => this.pickWinner(g));

    const div = this.projectDivisional(seasonYear, conference, seeds, wcWinners);
    const divWinners = div.matchups.map((g) => this.pickWinner(g));

    const conf = this.projectConferenceChamp(seasonYear, conference, divWinners);

    return [wc, div, conf];
  }

  private projectWildCard(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[]
  ): PlayoffRoundGroup {
    const pairs = [
      { slot: '2v7', home: 2, away: 7 },
      { slot: '3v6', home: 3, away: 6 },
      { slot: '4v5', home: 4, away: 5 },
    ];

    const matchups: PlayoffMatchup[] = pairs.map((p) => {
      const home = seeds.find((s) => s.seed === p.home)!;
      const away = seeds.find((s) => s.seed === p.away)!;

      return {
        gameId: null,
        seasonYear,
        round: 'WILDCARD',
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

    return {
      round: 'WILDCARD',
      conference,
      matchups,
    };
  }

  private projectDivisional(
    seasonYear: number,
    conference: PlayoffConference,
    seeds: SeededTeam[],
    wcWinners: number[]
  ): PlayoffRoundGroup {
    // 1-seed must exist for this projection to make sense
    const oneSeed = seeds.find((s) => s.seed === 1);
    if (!oneSeed) {
      return {
        round: 'DIVISIONAL',
        conference,
        matchups: [],
      };
    }

    // Attach seeds to the WC winners
    const winnersWithSeeds: SeededTeam[] = wcWinners
      .map((teamId) => {
        const info = seeds.find((s) => s.teamId === teamId);
        if (!info) {
          throw new Error(
            `ProjectedBracketBuilder: missing seed info for teamId=${teamId}`
          );
        }
        return info;
      })
      // sort by seed ASC → [best, middle, worst]
      .sort((a, b) => a.seed - b.seed);

    if (winnersWithSeeds.length !== 3) {
      // Safety fallback – if something odd happens, don't blow up
      return {
        round: 'DIVISIONAL',
        conference,
        matchups: [],
      };
    }

    const best = winnersWithSeeds[0];   // lowest number (e.g. 2)
    const middle = winnersWithSeeds[1]; // next best (e.g. 3)
    const worst = winnersWithSeeds[2];  // highest number (e.g. 4 = "lowest seed")

    // NFL rule:
    //  - 1-seed plays the *lowest* remaining seed (worst, largest number)
    //  - remaining two play each other (home = better seed)
    const m1: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'DIVISIONAL',
      conference,
      slot: `${conference}_DIV_1`,
      homeTeamId: oneSeed.teamId,
      awayTeamId: worst.teamId,
      homeSeed: oneSeed.seed,
      awaySeed: worst.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    const m2: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'DIVISIONAL',
      conference,
      slot: `${conference}_DIV_2`,
      homeTeamId: best.teamId,
      awayTeamId: middle.teamId,
      homeSeed: best.seed,
      awaySeed: middle.seed,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    return {
      round: 'DIVISIONAL',
      conference,
      matchups: [m1, m2],
    };
  }

  private projectConferenceChamp(
    seasonYear: number,
    conference: PlayoffConference,
    divWinners: number[]
  ): PlayoffRoundGroup {
    const match: PlayoffMatchup = {
      gameId: null,
      seasonYear,
      round: 'CONFERENCE',
      conference,
      slot: `${conference}_CONF_1`,
      homeTeamId: divWinners[0],
      awayTeamId: divWinners[1],
      homeSeed: null,
      awaySeed: null,
      homeScore: null,
      awayScore: null,
      winnerTeamId: null,
      gameDate: null,
    };

    return {
      round: 'CONFERENCE',
      conference,
      matchups: [match],
    };
  }

  private pickWinner(game: PlayoffMatchup): number {
    // For now: better seed (lower number) always wins
    return (game.homeSeed ?? 99) < (game.awaySeed ?? 99)
      ? game.homeTeamId!
      : game.awayTeamId!;
  }
}
