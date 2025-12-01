// src/utils/schedule/scheduleNormalizer.ts
import type { EventDTO, GameStatus, NormalizedGameDTO, ScoringPlayDTO } from './scheduleTypes';
import { formatDate, derivePrimetime } from './dateHelpers';
import { resolveTeamLogo } from '../resolveTeamLogo';
import { TEAM_COLOR_MAP } from '../TEAM_COLOR_MAP';

export function normalizeEvent(ev: EventDTO): NormalizedGameDTO {
  const comp = ev.competitions?.[0];
  const competitors: any[] = comp?.competitors ?? [];

  const homeRaw = competitors.find(c => c.homeAway === 'home');
  const awayRaw = competitors.find(c => c.homeAway === 'away');

  const homeTeam = homeRaw?.team ?? {};
  const awayTeam = awayRaw?.team ?? {};

  const homeName: string = homeTeam.displayName ?? homeTeam.name ?? 'TBD';
  const awayName: string = awayTeam.displayName ?? awayTeam.name ?? 'TBD';

  const scoringSummaryShort: string | null = '';
  const scoringPlays: ScoringPlayDTO[] = [];   // ✅ matches DTO

  const homeScore: number | null =
    homeRaw?.score != null ? Number(homeRaw.score) : null;
  const awayScore: number | null =
    awayRaw?.score != null ? Number(awayRaw.score) : null;

  const homeWinner: boolean = homeRaw?.winner === true;
  const awayWinner: boolean = awayRaw?.winner === true;

  const statusRaw: string =
    comp?.status?.type?.shortDetail ??
    comp?.status?.type?.description ??
    ev.status ??
    'Scheduled';

  const statusLower = statusRaw.toLowerCase();
  const status: NormalizedGameDTO['status'] =
    statusLower.includes('final')
      ? 'Final'
      : statusLower.includes('progress')
        ? 'In Progress'
        : statusLower.includes('post')
          ? 'Postponed'
          : 'Scheduled';

  const date = ev.date;
  const dateFormatted = formatDate(date);
  const { isPrimetime, primetimeType } = derivePrimetime(date);

  return {
    id: ev.id,

    date,
    dateFormatted,

    homeTeamId: homeTeam.id ?? null,
    homeTeamName: homeName,
    homeLogoEspn: '',
    homeLogoLocal: resolveTeamLogo(homeName),

    homeScore,
    homeWinner,
    teamColorHome: TEAM_COLOR_MAP[homeName] ?? '#666',

    awayTeamId: awayTeam.id ?? null,
    awayTeamName: awayName,
    awayLogoEspn: '',
    awayLogoLocal: resolveTeamLogo(awayName),
    awayScore,
    awayWinner,
    teamColorAway: TEAM_COLOR_MAP[awayName] ?? '#666',

    status,
    statusDetail: statusRaw,

    isPrimetime,
    primetimeType,

    scoringSummaryShort,
    scoringPlays,      // ✅ property name matches interface
  };
}


export function normalizeEvents(events: EventDTO[]): NormalizedGameDTO[] {
  return events.map(ev => normalizeEvent(ev));
}
// -----------------------------------------------------
// STATUS NORMALIZATION
// -----------------------------------------------------
export function normalizeStatus(raw: string): GameStatus {
  const lower = raw?.toLowerCase() || ''

  if (lower.includes('final')) return 'Final'
  if (lower.includes('progress')) return 'In Progress'
  if (lower.includes('postpon')) return 'Postponed'

  return 'Scheduled'
}