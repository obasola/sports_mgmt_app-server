export type PrimetimeSlot = 'TNF' | 'SNF' | 'MNF' | 'SundayEarly' | 'SundayLate' | 'Other'

export function classifyKickoff(date: Date): PrimetimeSlot {
  const local = new Date(date)
  const day = local.getDay() // 0=Sun, 1=Mon...
  const hour = local.getHours()

  if (day === 4 && hour >= 19) return 'TNF'
  if (day === 1 && hour >= 19) return 'MNF'
  if (day === 0 && hour >= 19) return 'SNF'
  if (day === 0 && hour < 15) return 'SundayEarly'
  if (day === 0 && hour >= 15 && hour < 19) return 'SundayLate'

  return 'Other'
}
