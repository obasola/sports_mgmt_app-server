import axios, { AxiosInstance } from 'axios'
import pRetry,{ AbortError } from 'p-retry'
import pLimit from 'p-limit'
import crypto from 'node:crypto'
import { MemoryCache } from './cache/memoryCache'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'

export type SeasonType = 1 | 2 | 3 // 1=pre, 2=reg, 3=post

// Preferred: pass { year, seasonType, week? } or { date: 'YYYYMMDD' }
export interface ScoreboardParams {
  date?: string        // e.g. "20250810"
  year?: number        // e.g. 2025  <-- use 'year' (NOT 'season')
  seasonType?: SeasonType
  week?: number
}

const limit = pLimit(Number(process.env.ESPN_MAX_CONCURRENCY ?? 4))
const cache = new MemoryCache<any>({ max: 1000 })
const TTL = 60_000
const DEFAULT_TTL = Number(process.env.ESPN_TTL_MS ?? 5 * 60 * 1000)

async function httpGet(params: Record<string, string|number|undefined>) {
  const res = await axios.get(BASE, {
    params,
    timeout: 15000,
    headers: {
      'User-Agent': 'MyNFL/1.0 (+https://draftproanalytics.com)',
      Accept: 'application/json, text/plain, */*',
    },
    validateStatus: () => true,
  })
  if (res.status >= 200 && res.status < 300) return res.data
  const detail = (res.data && (res.data.detail || res.data.message)) || `HTTP ${res.status}`
  if (res.status >= 500) throw new Error(`ESPN 5xx: ${detail}`)
  throw new AbortError(`ESPN non-2xx: ${detail}`)
}

export async function fetchScoreboard(params: ScoreboardParams) {
  // translate legacy 'season' to 'year'
  if (params.year != null && params.year == null) {
    console.warn('[scoreboardClient] Received legacy param season=. Translating to year.')
    params.year = params.year
    delete (params as any).season
  }

  // build canonical query
  const q: Record<string, string|number|undefined> = {}
  if (params.date) q.dates = params.date
  if (params.year != null) q.year = params.year
  if (params.seasonType != null) q.seasontype = params.seasonType
  if (params.week != null) q.week = params.week

  try {
    return await pRetry(() => httpGet(q), { retries: 2, factor: 2, minTimeout: 500 })
  } catch (e) {
    // fallback to a computed date if we had year/type/week
    if (!params.date && params.year != null && params.seasonType != null && params.week != null) {
      const fallbackDate = weekToSunday(params.year, params.week, params.seasonType)
      return await pRetry(() => httpGet({ dates: fallbackDate }), { retries: 2, factor: 2, minTimeout: 500 })
    }
    throw e
  }
}
function weekToSunday(year: number, week: number, seasonType: SeasonType) {
  // naive anchor; good enough to form a date fallback
  const base =
    seasonType === 2 ? new Date(Date.UTC(year, 8, 1)) :           // Sep 1
    seasonType === 1 ? new Date(Date.UTC(year, 7, 1)) :           // Aug 1
                       new Date(Date.UTC(year + 1, 0, 1))         // Jan 1 (post)
  const day = base.getUTCDay()
  const delta = (7 - day) % 7
  const firstSunday = new Date(base)
  firstSunday.setUTCDate(base.getUTCDate() + delta)
  const target = new Date(firstSunday)
  target.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7)
  const y = target.getUTCFullYear()
  const m = String(target.getUTCMonth() + 1).padStart(2, '0')
  const d = String(target.getUTCDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export async function getJson(url: string) {
  const now = Date.now()
  const cached = cache.get(url)
  if (cached && now - cached.ts < TTL) return cached.data

  if (process.env.ESPN_OFFLINE === '1') {
    const date = process.env.FIXTURE_DATE || new Date().toISOString().slice(0,10)
    const rel = url.includes('/scoreboard')
      ? `fixtures/espn/scoreboard/${date.replace(/-/g, '')}.json`
      : url.includes('/teams')
      ? `fixtures/espn/teams/${date}.json`
      : `fixtures/espn/players/unknown-${date}.json`
    const p = path.resolve(process.cwd(), rel)
    const raw = await readFile(p, 'utf-8')
    const data = JSON.parse(raw)
    cache.set(url, { ts: now, data })
    return data
  }

  const data = await pRetry(() => httpGetJson(url), {
    retries: 3,
    factor: 2,
    minTimeout: 500,
  })
  cache.set(url, { ts: now, data })
  return data
}

async function httpGetJson(url: string) {
  const res = await axios.get(url, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'MyNFL/1.0 (+https://draftproanalytics.com)',
      Accept: 'application/json, text/plain, */*',
    },
    validateStatus: () => true, // let us handle non-2xx
  })
  if (res.status >= 200 && res.status < 300) return res.data
  const detail = (res.data && (res.data.detail || res.data.message)) || `HTTP ${res.status}`
  // ESPN returns 500 for bad params. Don’t retry forever on a parameter error if we detect it.
  if (res.status >= 500) throw new Error(`ESPN 5xx: ${detail}`)
  throw new AbortError(`ESPN non-2xx: ${detail}`)
}
