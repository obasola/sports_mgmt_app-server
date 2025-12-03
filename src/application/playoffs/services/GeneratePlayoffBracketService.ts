// src/application/playoffs/services/GeneratePlayoffBracketService.ts
import type {
  PlayoffBracket,
  PlayoffRoundGroup,
} from '@/domain/playoffs/valueObjects/PlayoffBracket';
import type {
  PlayoffMatchup,
  PlayoffConference,
  PlayoffRound,
} from '@/domain/playoffs/valueObjects/PlayoffTypes';
import type {
  IGameRepository,
  PlayoffGameSummary,
} from '@/domain/game/repositories/IGameRepository';
import type { ITeamStandingsRepository } from '@/domain/standings/repositories/ITeamStandingsRepository';
import type { TeamStanding } from '@/domain/standings/interface/TeamStanding';
import type { SeededTeam } from './PlayoffSeedingService';
import { PlayoffSeedingService } from './PlayoffSeedingService';
import type { PlayoffBracketService } from './PlayoffBracketService';

export class GeneratePlayoffBracketService implements PlayoffBracketService {
  private readonly gameRepository: IGameRepository;
  private readonly standingsRepository: ITeamStandingsRepository;
  private readonly seedingService: PlayoffSeedingService;

  constructor(
    gameRepository: IGameRepository,
    standingsRepository: ITeamStandingsRepository,
    seedingService: PlayoffSeedingService
  ) {
    this.gameRepository = gameRepository;
    this.standingsRepository = standingsRepository;
    this.seedingService = seedingService;
  }

  public async getBracketForSeason(seasonYear: number): Promise<PlayoffBracket> {
    // Use regular season (seasonType = 2) for seeding
    const seasonType = 2;

    const [allStandings, playoffGames] = await Promise.all([
      this.standingsRepository.computeStandings(seasonYear, seasonType),
      this.gameRepository.findPlayoffGamesBySeason(seasonYear),
    ]);

    const afcStandings = this.filterByConference(allStandings, 'AFC');
    const nfcStandings = this.filterByConference(allStandings, 'NFC');

    const afcSeeds = this.seedingService.computeSeeds(afcStandings);
    const nfcSeeds = this.seedingService.computeSeeds(nfcStandings);

    const afcRounds = this.buildConferenceBracket(
      'AFC',
      seasonYear,
      afcSeeds,
      playoffGames
    );

    const nfcRounds = this.buildConferenceBracket(
      'NFC',
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

  private filterByConference(
    standings: TeamStanding[],
    conference: PlayoffConference
  ): TeamStanding[] {
    return standings.filter((row) => row.conference === conference);
  }

  private buildConferenceBracket(
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[],
    playoffGames: PlayoffGameSummary[]
  ): PlayoffRoundGroup[] {
    const wildcard = this.buildRound(
      'WILDCARD',
      conference,
      seasonYear,
      seeds,
      playoffGames
    );
    const divisional = this.buildRound(
      'DIVISIONAL',
      conference,
      seasonYear,
      seeds,
      playoffGames
    );
    const conferenceChamp = this.buildRound(
      'CONFERENCE',
      conference,
      seasonYear,
      seeds,
      playoffGames
    );

    return [wildcard, divisional, conferenceChamp];
  }

  private buildRound(
    round: Extract<PlayoffRound, 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE'>,
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[],
    playoffGames: PlayoffGameSummary[]
  ): PlayoffRoundGroup {
    const gamesForRound = playoffGames.filter(
      (g) =>
        g.playoffConference === conference &&
        g.playoffRound === round &&
        g.seasonYear === seasonYear
    );

    const matchups: PlayoffMatchup[] =
      gamesForRound.length > 0
        ? gamesForRound.map((g, index) => ({
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
            winnerTeamId: this.computeWinner(
              g.homeTeamId,
              g.awayTeamId,
              g.homeScore,
              g.awayScore
            ),
            gameDate: g.gameDate,
          }))
        : this.projectHypotheticalMatchups(round, conference, seasonYear, seeds);

    return {
      round,
      conference,
      matchups,
    };
  }

  private buildSuperBowl(
    seasonYear: number,
    playoffGames: PlayoffGameSummary[]
  ): PlayoffMatchup | null {
    const sb = playoffGames.find(
      (g) => g.playoffRound === 'SUPERBOWL' && g.seasonYear === seasonYear
    );

    if (!sb) {
      return null;
    }

    return {
      gameId: sb.id,
      seasonYear,
      round: 'SUPERBOWL',
      conference: 'AFC', // arbitrary; teams themselves know their conference elsewhere
      slot: 'SUPERBOWL',
      homeTeamId: sb.homeTeamId,
      awayTeamId: sb.awayTeamId,
      homeSeed: sb.homeSeed,
      awaySeed: sb.awaySeed,
      homeScore: sb.homeScore,
      awayScore: sb.awayScore,
      winnerTeamId: this.computeWinner(
        sb.homeTeamId,
        sb.awayTeamId,
        sb.homeScore,
        sb.awayScore
      ),
      gameDate: sb.gameDate,
    };
  }

  private computeWinner(
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

  private projectHypotheticalMatchups(
    round: Extract<PlayoffRound, 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE'>,
    conference: PlayoffConference,
    seasonYear: number,
    seeds: SeededTeam[]
  ): PlayoffMatchup[] {
    if (round === 'WILDCARD') {
      // #1 seed bye; WC = (2–7, 3–6, 4–5)
      const findSeed = (seedNumber: number): SeededTeam | undefined =>
        seeds.find((s) => s.seed === seedNumber);

      const pairs: Array<{ from: [number, number]; label: string }> = [
        { from: [2, 7], label: '2v7' },
        { from: [3, 6], label: '3v6' },
        { from: [4, 5], label: '4v5' },
      ];

      return pairs.map((slot) => {
        const home = findSeed(slot.from[0]);
        const away = findSeed(slot.from[1]);

        return {
          gameId: null,
          seasonYear,
          round,
          conference,
          slot: `${conference}_${round}_${slot.label}`,
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

    // For now we only project WC; DIV/CONF will populate once games exist.
    return [];
  }
}
