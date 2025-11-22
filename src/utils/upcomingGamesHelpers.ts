// src/util/upcomingGamesHelpers.ts
// Full DTO + helper suite for upcoming games view

 
import { GameStatus } from '@/types/schedule/upcomingGames'
import { resolveTeamLogo } from '@/utils/resolveTeamLogo'

// ---------------------------------------------
// DTO
// ---------------------------------------------
export interface UpcomingGameDto {
  id: number
  dateFormatted: {
    day: string
    time: string
  }
  homeTeamName: string
  awayTeamName: string
  homeLogo: string
  awayLogo: string
  homeScore: number | null
  awayScore: number | null
  status: 'Scheduled' | 'In Progress' | 'Final' | 'Postponed'
  statusDetail: string
  isPrimetime: boolean
  primetimeType: 'TNF' | 'SNF' | 'MNF' | null
  teamColorHome: string
  teamColorAway: string
}

// ---------------------------------------------
// Full 32-team dictionary
// ---------------------------------------------
interface TeamInfo {
  abbr: string
  name: string
  primaryColor: string
  secondaryColor: string
}

const TEAM_MAP: Record<string, TeamInfo> = {
  'Arizona Cardinals': { abbr: 'ARI', name: 'Arizona Cardinals', primaryColor: '#97233F', secondaryColor: '#000000' },
  'Atlanta Falcons': { abbr: 'ATL', name: 'Atlanta Falcons', primaryColor: '#A71930', secondaryColor: '#000000' },
  'Baltimore Ravens': { abbr: 'BAL', name: 'Baltimore Ravens', primaryColor: '#241773', secondaryColor: '#9E7C0C' },
  'Buffalo Bills': { abbr: 'BUF', name: 'Buffalo Bills', primaryColor: '#00338D', secondaryColor: '#C60C30' },
  'Carolina Panthers': { abbr: 'CAR', name: 'Carolina Panthers', primaryColor: '#0085CA', secondaryColor: '#101820' },
  'Chicago Bears': { abbr: 'CHI', name: 'Chicago Bears', primaryColor: '#0B162A', secondaryColor: '#C83803' },
  'Cincinnati Bengals': { abbr: 'CIN', name: 'Cincinnati Bengals', primaryColor: '#FB4F14', secondaryColor: '#000000' },
  'Cleveland Browns': { abbr: 'CLE', name: 'Cleveland Browns', primaryColor: '#311D00', secondaryColor: '#FF3C00' },
  'Dallas Cowboys': { abbr: 'DAL', name: 'Dallas Cowboys', primaryColor: '#002244', secondaryColor: '#B0B7BC' },
  'Denver Broncos': { abbr: 'DEN', name: 'Denver Broncos', primaryColor: '#FB4F14', secondaryColor: '#002244' },
  'Detroit Lions': { abbr: 'DET', name: 'Detroit Lions', primaryColor: '#0076B6', secondaryColor: '#B0B7BC' },
  'Green Bay Packers': { abbr: 'GB', name: 'Green Bay Packers', primaryColor: '#203731', secondaryColor: '#FFB612' },
  'Houston Texans': { abbr: 'HOU', name: 'Houston Texans', primaryColor: '#03202F', secondaryColor: '#A71930' },
  'Indianapolis Colts': { abbr: 'IND', name: 'Indianapolis Colts', primaryColor: '#002C5F', secondaryColor: '#A2AAAD' },
  'Jacksonville Jaguars': { abbr: 'JAX', name: 'Jacksonville Jaguars', primaryColor: '#006778', secondaryColor: '#9F792C' },
  'Kansas City Chiefs': { abbr: 'KC', name: 'Kansas City Chiefs', primaryColor: '#E31837', secondaryColor: '#FFB81C' },
  'Las Vegas Raiders': { abbr: 'LV', name: 'Las Vegas Raiders', primaryColor: '#000000', secondaryColor: '#A5ACAF' },
  'Los Angeles Chargers': { abbr: 'LAC', name: 'Los Angeles Chargers', primaryColor: '#0080C6', secondaryColor: '#FFC20E' },
  'Los Angeles Rams': { abbr: 'LAR', name: 'Los Angeles Rams', primaryColor: '#003594', secondaryColor: '#FFA300' },
  'Miami Dolphins': { abbr: 'MIA', name: 'Miami Dolphins', primaryColor: '#008E97', secondaryColor: '#F58220' },
  'Minnesota Vikings': { abbr: 'MIN', name: 'Minnesota Vikings', primaryColor: '#4F2683', secondaryColor: '#FFC62F' },
  'New England Patriots': { abbr: 'NE', name: 'New England Patriots', primaryColor: '#002244', secondaryColor: '#C60C30' },
  'New Orleans Saints': { abbr: 'NO', name: 'New Orleans Saints', primaryColor: '#D3BC8D', secondaryColor: '#101820' },
  'New York Giants': { abbr: 'NYG', name: 'New York Giants', primaryColor: '#0B2265', secondaryColor: '#A71930' },
  'New York Jets': { abbr: 'NYJ', name: 'New York Jets', primaryColor: '#125740', secondaryColor: '#FFFFFF' },
  'Philadelphia Eagles': { abbr: 'PHI', name: 'Philadelphia Eagles', primaryColor: '#004C54', secondaryColor: '#A5ACAF' },
  'Pittsburgh Steelers': { abbr: 'PIT', name: 'Pittsburgh Steelers', primaryColor: '#FFB612', secondaryColor: '#101820' },
  'San Francisco 49ers': { abbr: 'SF', name: 'San Francisco 49ers', primaryColor: '#AA0000', secondaryColor: '#B3995D' },
  'Seattle Seahawks': { abbr: 'SEA', name: 'Seattle Seahawks', primaryColor: '#002244', secondaryColor: '#69BE28' },
  'Tampa Bay Buccaneers': { abbr: 'TB', name: 'Tampa Bay Buccaneers', primaryColor: '#D50A0A', secondaryColor: '#34302B' },
  'Tennessee Titans': { abbr: 'TEN', name: 'Tennessee Titans', primaryColor: '#4B92DB', secondaryColor: '#0C2340' },
  'Washington Commanders': { abbr: 'WAS', name: 'Washington Commanders', primaryColor: '#5A1414', secondaryColor: '#FFB612' }
}
 

// ---------------------------------------------
// Date formatting (America/New_York)
// ---------------------------------------------
export function formatDate(raw: string) {
  if (!raw) return { day: '--', time: '--' }

  const d = new Date(raw)

  if (String(d) === 'Invalid Date') {
    return { day: '--', time: '--' }
  }

  const day = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })

  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })

  return { day, time }
}

// ---------------------------------------------
// Primetime logic
// ---------------------------------------------

export function derivePrimetime(iso: string) {
  const d = new Date(iso)
  if (String(d) === 'Invalid Date') {
    return { isPrimetime: false, primetimeType: null }
  }

  const day = d.getDay()
  const hour = d.getHours()

  if (day === 4 && hour >= 19) {
    return { isPrimetime: true, primetimeType: 'TNF' as const }
  }
  if (day === 0 && hour >= 19) {
    return { isPrimetime: true, primetimeType: 'SNF' as const }
  }
  if (day === 1 && hour >= 19) {
    return { isPrimetime: true, primetimeType: 'MNF' as const }
  }

  return { isPrimetime: false, primetimeType: null }
}

// ---------------------------------------------
// Status logic
// ---------------------------------------------
export function deriveStatus(competition: any) {
  if (!competition) {
    return { status: 'Scheduled' as const, detail: '' }
  }

  const state = competition.status?.type?.state ?? 'pre'
  const detail = competition.status?.type?.detail ?? ''

  switch (state) {
    case 'pre':
      return { status: 'Scheduled' as const, detail }
    case 'in':
      return { status: 'In Progress' as const, detail }
    case 'post':
      return { status: 'Final' as const, detail: detail || 'Final' }
    case 'postponed':
      return { status: 'Postponed' as const, detail: 'Postponed' }
    default:
      return { status: 'Scheduled' as const, detail }
  }
}

// ---------------------------------------------
// Score derivation
// ---------------------------------------------
export function deriveScores(competition: any) {
  if (!competition) {
    return { homeScore: null, awayScore: null }
  }

  const competitors = competition.competitors ?? []
  const home = competitors.find((c: any) => c.homeAway === 'home')
  const away = competitors.find((c: any) => c.homeAway === 'away')

  return {
    homeScore: home ? Number(home.score ?? null) : null,
    awayScore: away ? Number(away.score ?? null) : null
  }
}

// ---------------------------------------------
// Map event → DTO
/* ---------------------------------------------
export function mapEventToDto(
  scheduleEvent: any,
  scoreboardEvent: any
): UpcomingGameDto {
  // -------------------------------
  // Parse team names
  // shortName example: "NYJ @ NE"
  // name example: "New York Jets at New England Patriots"
  // -------------------------------
  const fullName = scheduleEvent.name as string
  const [awayFull, homeFull] = fullName.split(' at ')

  const awayTeam = TEAM_MAP[awayFull.trim()]
  const homeTeam = TEAM_MAP[homeFull.trim()]

  // -------------------------------
  // Date formatting
  // -------------------------------
  const dateFormatted = formatDate(scheduleEvent.date)

  // -------------------------------
  // Scoreboard competition
  // -------------------------------
  const competition =
    scoreboardEvent?.competitions?.[0] ??
    null

  const { status, detail } = deriveStatus(competition)
  const { homeScore, awayScore } = deriveScores(competition)

  // -------------------------------
  // Primetime
  // -------------------------------
  const { isPrimetime, primetimeType } = derivePrimetime(scheduleEvent.date)

  // -------------------------------
  // Logo / Colors
  // -------------------------------
  const homeLogo = resolveTeamLogo(homeTeam.name)
  const awayLogo = resolveTeamLogo(awayTeam.name)

  return {
    id: scheduleEvent.id,
    dateFormatted,
    homeTeamName: homeTeam.name,
    awayTeamName: awayTeam.name,
    homeLogo,
    awayLogo,
    homeScore,
    awayScore,
    status,
    statusDetail: detail,
    isPrimetime,
    primetimeType,
    teamColorHome: homeTeam.primaryColor,
    teamColorAway: awayTeam.primaryColor
  }
}
*/