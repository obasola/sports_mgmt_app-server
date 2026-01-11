// draftproanalytics-server/src/utils/standings/buildGamesWithTeams.ts

import type { TeamStanding } from '@/domain/standings/interface/TeamStanding';
import type { Game } from '@/domain/game/entities/Game';
import type { GameWithTeams } from '@/application/standings/services/ComputeStandingsService';
import type { TeamInfo } from '@/application/standings/services/ComputeStandingsService';

const norm = (v: unknown): string => String(v ?? '').trim();

function toOptionalNumber(n: number | null | undefined): number | undefined {
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

function requireString(v: unknown, label: string): string {
  const s = norm(v);
  if (s.length === 0) throw new Error(`buildGamesWithTeams: missing ${label}`);
  return s;
}

function teamInfoFromStanding(s: TeamStanding): TeamInfo {
  // If your TeamStanding uses slightly different field names, adjust these 4 lines.
  // Keeping it strict: if any are missing, we throw with a clear error.
  return {
    id: s.teamId,
    name: requireString(
      (s as unknown as { teamName?: unknown }).teamName ??
        (s as unknown as { name?: unknown }).name,
      'team name'
    ),
    conference: requireString(s.conference, 'conference'),
    division: requireString(s.division, 'division'),
  };
}

export function buildGamesWithTeams(args: {
  games: Game[];
  standings: TeamStanding[];
  seasonYear: number;
}): GameWithTeams[] {
  const { games, standings, seasonYear } = args;

  const byTeamId = new Map<number, TeamInfo>();
  for (const s of standings) {
    byTeamId.set(s.teamId, teamInfoFromStanding(s));
  }

  function requireNumber(v: unknown, label: string): number {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`buildGamesWithTeams: missing/invalid ${label}`);
    }
    return v;
  }

  return games.map((g) => {
    const homeTeam = byTeamId.get(g.homeTeamId);
    const awayTeam = byTeamId.get(g.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error(
        `buildGamesWithTeams: missing TeamInfo for game id=${String(g.id)}, homeTeamId=${g.homeTeamId}, awayTeamId=${g.awayTeamId}`
      );
    }

    const id = requireNumber(g.id, 'game id');

    return {
      id,
      seasonYear: String(seasonYear),
      gameWeek: g.gameWeek ?? undefined,
      seasonType: g.seasonType ?? undefined,
      gameDate: g.gameDate ?? undefined,
      homeTeamId: g.homeTeamId,
      awayTeamId: g.awayTeamId,
      homeScore: toOptionalNumber(g.homeScore),
      awayScore: toOptionalNumber(g.awayScore),
      gameStatus: norm(g.gameStatus),
      homeTeam,
      awayTeam,
    };
  });
}
