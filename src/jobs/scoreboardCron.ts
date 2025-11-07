// src/jobs/scoreboardCron.ts
import { schedule, ScheduledTask } from 'node-cron'
import { getSchedule, saveSchedule } from '@/services/ScoreboardScheduleService'
import type { ScoreboardSchedule, Day } from '@/types/scoreboardSchedule'
import { JobService } from '@/services/JobService'
import { jobLogger, importWeekService, backfillSeasonService, syncTeamsService } from '@/infrastructure/dependencies';
import { nowInTz, dayCode, yyyymmddInTz, isAtScheduledTime } from './dateUtils'; // keep your helpers



let task: ScheduledTask | null = null



// Example usage:
export async function runScoreboardCron() {
  let now = new Date();
  let year = now.getFullYear();
  await syncTeamsService.run();
  await importWeekService.run({ seasonYear: String(year), seasonType: 2, week: 1 });
  // or backfill:
  // await backfillSeasonService.run({ year: 2024, seasonType: 2 });
}

export async function runOnce(schedule: ScoreboardSchedule) {
  if (!schedule.enabled) return;

  const when = nowInTz(schedule.timezone);
  const dow = dayCode(when, schedule.timezone);
  if (!schedule.days.includes(dow)) return;

  const date = yyyymmddInTz(when, schedule.timezone);

  // Start a job
  const { jobId } = await jobLogger.start({
    jobType: 'ENRICHMENT',
    params: { source: 'espn.scoreboard', mode: 'cron', date, seasonType: schedule.seasonType, week: schedule.week },
  });

  try {
    await jobLogger.log(jobId, { message: `Cron tick at ${date} (${schedule.timezone})` });

    // Keep team mappings fresh
    await jobLogger.log(jobId, { message: 'Syncing teams from ESPN...' });
    await syncTeamsService.run();

    // Import the configured week
    await jobLogger.log(jobId, { message: `Importing seasonType=${schedule.seasonType}, week=${schedule.week}...` });
    const result = await importWeekService.run({
      seasonYear: schedule.seasonYear,
      seasonType: schedule.seasonType,
      week: schedule.week,
    });

    await jobLogger.succeed(jobId, {
      totalEvents: result.totalEvents,
      upserts: result.upserts,
      skipped: result.skipped,
      seasonYear: result.seasonYear,
      seasonType: result.seasonType,
      week: result.week,
    });
  } catch (err: any) {
    await jobLogger.fail(jobId, err?.message ?? 'Scoreboard cron failed', {
      stack: String(err?.stack ?? ''),
    });
  }
}

export async function initScoreboardCron() {
  console.log("initializing scoreboardScheduler")
  const s = await getSchedule()
  await rescheduleCron(s)
}

export async function rescheduleCron(s: ScoreboardSchedule) {
  await saveSchedule(s)

  if (task) {
    task.stop()
    task.destroy()
    task = null
  }

  if (!s.enabled) return

  const expr = `${s.minute} ${s.hour} * * *`
  task = schedule(expr, () => runOnce(s), { timezone: s.timezone })
}
