/* eslint-disable no-console */
// src/cli/importScores.ts
import 'dotenv/config';
import { importWeekService } from '../infrastructure/dependencies';

const [seasonYear, seasonTypeStr, weekStr] = process.argv.slice(2);
if (!seasonYear || !seasonTypeStr || !weekStr) {
  console.error('Usage: importScores <year> <seasonType> <week>');
  process.exit(1);
}

const seasonType = Number(seasonTypeStr) as 1 | 2 | 3;
const week = Number(weekStr);

(async () => {
  try {
    console.time('importScores');
    const res = await importWeekService.run({ seasonYear, seasonType, week });
    console.timeEnd('importScores');
    if (res.scoreChanges?.length) {
      console.log('\n🏈 Score updates this week:');
      for (const g of res.scoreChanges) {
        console.log(`${g.homeTeam}: ${g.homeScore} -vs- ${g.awayTeam}: ${g.awayScore}`);
      }
      console.log('');
    } else {
      console.log('\n(No score changes detected.)\n');
    }

    console.log(JSON.stringify(res, null, 2));

    process.exit(0);
  } catch (err: any) {
    console.error('❌ import failed:', err?.message ?? err);
    process.exit(1);
  }
})();
