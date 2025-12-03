// src/application/playoffs/services/PlayoffSeedingService.ts
import type { TeamStanding } from '@/domain/standings/interface/TeamStanding';

export interface SeededTeam {
  teamId: number;
  seed: number;
  isDivisionWinner: boolean;
}

export class PlayoffSeedingService {
  public computeSeeds(standings: TeamStanding[]): SeededTeam[] {
    if (standings.length === 0) {
      return [];
    }

    // 1) Division winners
    const divisionWinners: TeamStanding[] = [];
    const remaining: TeamStanding[] = [];

    const byDivision: Record<string, TeamStanding[]> = {};
    for (const row of standings) {
      const key = row.division; // e.g. "AFC West", or whatever your data uses
      if (!byDivision[key]) {
        byDivision[key] = [];
      }
      byDivision[key].push(row);
    }

    for (const divisionKey of Object.keys(byDivision)) {
      const teamsInDivision = byDivision[divisionKey];
      const sorted = this.sortByRecord(teamsInDivision);
      if (sorted.length > 0) {
        divisionWinners.push(sorted[0]);
      }
    }

    const divisionWinnerIds = new Set<number>(
      divisionWinners.map((t) => t.teamId)
    );

    for (const row of standings) {
      if (!divisionWinnerIds.has(row.teamId)) {
        remaining.push(row);
      }
    }

    // 2) Order division winners by conference record (seed 1–4)
    const sortedDivisionWinners = this.sortByRecord(divisionWinners);

    // 3) Order wildcards (best remaining teams) for seeds 5–7
    const sortedWildcards = this.sortByRecord(remaining);

    const seeded: SeededTeam[] = [];

    sortedDivisionWinners.forEach((row, index) => {
      const seed = index + 1;
      seeded.push({
        teamId: row.teamId,
        seed,
        isDivisionWinner: true,
      });
    });

    sortedWildcards.slice(0, 3).forEach((row, index) => {
      const seed = 5 + index;
      seeded.push({
        teamId: row.teamId,
        seed,
        isDivisionWinner: false,
      });
    });

    return seeded.sort((a, b) => a.seed - b.seed);
  }

  /**
   * Sort teams by:
   *   1) winPct (desc)
   *   2) point differential (desc)
   *   3) pointsFor (desc)
   */
  private sortByRecord(teams: TeamStanding[]): TeamStanding[] {
    const clone = [...teams];

    clone.sort((a, b) => {
      if (b.winPct !== a.winPct) {
        return b.winPct - a.winPct;
      }

      const diffA = a.pointsFor - a.pointsAgainst;
      const diffB = b.pointsFor - b.pointsAgainst;
      if (diffB !== diffA) {
        return diffB - diffA;
      }

      return b.pointsFor - a.pointsFor;
    });

    return clone;
  }
}
