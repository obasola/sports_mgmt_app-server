import { EspnScoreboardClient } from '@/infrastructure/scoreboardClient'

export class ScoreboardCurrentService {
  private cache: { data: { year: number; seasonType: number; week: number }; expires: number } | null = null
  private readonly ttlMs = 5 * 60 * 1000 // 5 minutes

  constructor(private readonly client: EspnScoreboardClient) {}

  async getCurrentWeek() {
    const now = Date.now()
    if (this.cache && now < this.cache.expires) {
      return this.cache.data
    }

    const data = await this.client.getWeek({
      year: new Date().getFullYear(),
      seasonType: 2,
      week: 1,
    })

    const year = data?.season?.year ?? new Date().getFullYear()
    const seasonType = data?.season?.type ?? 2
    const week = data?.week?.number ?? 1

    const payload = { year, seasonType, week }
    this.cache = { data: payload, expires: now + this.ttlMs }

    return payload
  }
}
