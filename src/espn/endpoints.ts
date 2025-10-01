export const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

export const endpoints = {
  host: 'https://site.api.espn.com',
  base: '/apis/site/v2/sports/football/nfl',

  teams: () => `${ESPN_BASE}/teams`,
  team: (abbrevOrId: string|number) => `${ESPN_BASE}/teams/${abbrevOrId}`,
  teamRoster: (abbrevOrId: string|number) => `${ESPN_BASE}/teams/${abbrevOrId}?enable=roster,stats`,
  athletes: (teamId: string|number) => `${ESPN_BASE}/teams/${teamId}/roster`,
  schedule: (year: number) => `${ESPN_BASE}/scoreboard?seasontype=2&year=${year}`,
  players: (teamId: string|number) => `${ESPN_BASE}/teams/${teamId}?enable=roster`,
  //scoreboard: () => `${ESPN_BASE}/scoreboard`,

  scoreboard(opts: { year: number; seasonType: 1 | 2 | 3; week?: number } | { date: string }) : string {
    const u = new URL(this.host + this.base + '/scoreboard')
    if ('date' in opts) {
      // opts.date format: YYYYMMDD (e.g., 20250810)
      u.searchParams.set('dates', opts.date)
    } else {
      u.searchParams.set('year', String(opts.year))
      u.searchParams.set('seasontype', String(opts.seasonType))
      if (opts.week != null) u.searchParams.set('week', String(opts.week))
    }
    return u.toString()
  },
}