// src/jobs/dateUtils.ts
const DAY_CODES = ['SUN','MON','TUE','WED','THU','FRI','SAT'] as const;
export type DayCode = typeof DAY_CODES[number];

function partsInTz(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map(x => [x.type, x.value]));
  // weekday comes like "Mon", normalize to "MON"
  const weekday = String(p.weekday || '').slice(0,3).toUpperCase();
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: weekday as DayCode,
  };
}

export function nowInTz(timeZone: string): Date {
  // returns system now; use partsInTz for tz-aware comparisons/formatting
  return new Date();
}

export function dayCode(date: Date, timeZone: string): DayCode {
  return partsInTz(date, timeZone).weekday;
}

export function yyyymmddInTz(date: Date, timeZone: string): string {
  const { year, month, day } = partsInTz(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}${pad(month)}${pad(day)}`;
}

/**
 * Returns true if "now (in tz)" matches the schedule hour & minute.
 * Optionally allow a +/- window (minutes) to be safer with cron skew.
 */
export function isAtScheduledTime(
  date: Date,
  timeZone: string,
  schedHour: number,
  schedMinute: number,
  windowMinutes = 0
): boolean {
  const { hour, minute } = partsInTz(date, timeZone);
  if (windowMinutes === 0) return hour === schedHour && minute === schedMinute;

  // compute minutes since midnight and compare with tolerance
  const cur = hour * 60 + minute;
  const target = schedHour * 60 + schedMinute;
  return Math.abs(cur - target) <= windowMinutes;
}
