import axios, { AxiosInstance } from 'axios'

type Conference = 'AFC' | 'NFC'

interface EspnStat {
  name?: string
  type?: string
  value?: number
  displayValue?: string
}

interface EspnTeam {
  id: string
  abbreviation: string
  displayName: string
}

interface EspnEntry {
  team: EspnTeam
  stats: EspnStat[]
}

interface EspnStandingsBlock {
  season: number
  seasonType: number
  entries: EspnEntry[]
}

interface EspnConferenceNode {
  abbreviation: Conference
  standings: EspnStandingsBlock
}

interface EspnStandingsResponse {
  children: EspnConferenceNode[]
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPlayoffSeed(stats: EspnStat[]): number | null {
  const s =
    stats.find(x => x.name === 'playoffSeed') ??
    stats.find(x => (x.type ?? '').toLowerCase() === 'playoffseed')

  const v = s?.value
  if (typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 7) return Math.trunc(v)

  const dv = s?.displayValue
  if (typeof dv === 'string') {
    const n = Number(dv.trim())
    if (Number.isFinite(n) && n >= 1 && n <= 7) return Math.trunc(n)
  }

  return null
}


export class EspnStandingsClient {
  private readonly http: AxiosInstance

  constructor(http?: AxiosInstance) {
    this.http =
      http ??
      axios.create({
        baseURL: 'https://site.api.espn.com',
        timeout: 15_000,
      })
  }

  /**
   * Returns: map keyed by normalized ESPN team displayName -> seed (1..7) or null
   */
  async getPlayoffSeedsByTeamName(seasonYear: number, seasonType: 1 | 2 | 3): Promise<Record<string, number>> {
    const res = await this.http.get<EspnStandingsResponse>('/apis/v2/sports/football/nfl/standings', {
      params: { season: seasonYear, seasonType },
    })

    const out: Record<string, number> = {}

    for (const conf of res.data.children ?? []) {
      const entries = conf.standings?.entries ?? []
      for (const e of entries) {
        const seed = getPlayoffSeed(e.stats ?? [])
        if (seed === null) continue
        // only care about playoff seeds 1..7
        if (seed < 1 || seed > 7) continue

        const key = normalizeName(e.team.displayName)
        out[key] = seed
      }
    }

    return out
  }
}
