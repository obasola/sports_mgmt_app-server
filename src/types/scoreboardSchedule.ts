// src/types/scoreboardSchedule.ts
export type Day = 'SUN'|'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'

export interface ScoreboardSchedule {
  enabled: boolean
  days: Day[]                       // e.g. ['SUN','MON','THU','SAT']
  hour: number                      // 0..23
  minute: number                    // 0..59
  timezone: string                  // e.g. 'America/Chicago'
  mode?: 'by-week' | 'by-date'      // reserved for future 'by-week'
  seasonYear: string                // e.g. '2025'
  seasonType: 1 | 2 | 3;            // 1=pre,2=reg,3=post
  week: number; 
}

