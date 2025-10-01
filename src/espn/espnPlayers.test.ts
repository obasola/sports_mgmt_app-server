import { describe, it, expect, beforeEach } from 'vitest'
import nock from 'nock'
import { ESPN_BASE } from './endpoints'
import { getJson } from './espnClient'

describe('players endpoint', () => {
  beforeEach(() => nock.cleanAll())

  it('fetches and caches team roster', async () => {
    const scope = nock('https://site.api.espn.com')
      .get(/\/apis\/site\/v2\/sports\/football\/nfl\/teams\/kc\?enable=roster,stats$/)
      .reply(200, { items: [{ id: '123', displayName: 'Test Player' }] })

    const url = `${ESPN_BASE}/teams/kc?enable=roster,stats`
    const a = await getJson(url)
    const b = await getJson(url)
    expect(a).toHaveProperty('items')
    expect(scope.isDone()).toBe(true)
  })
})