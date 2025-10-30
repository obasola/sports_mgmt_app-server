#!/usr/bin/env ts-node
/* eslint-disable no-console */
import 'dotenv/config';
import { importWeekService } from '../infrastructure/dependencies';
import type { SeasonType } from '../infrastructure/scoreboardClient';

function parseArgv(argv: string[]) {
  const out: Record<string, string> = {};
  const pos: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > -1) out[a.slice(2, eq)] = a.slice(eq + 1);
      else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('-')) {
          out[key] = next;
          i++;
        } else out[key] = 'true';
      }
    } else pos.push(a);
  }
  return { flags: out, pos };
}

async function main() {
  const { flags, pos } = parseArgv(process.argv.slice(2));

  const yearStr = flags.year ?? pos[0];
  const seasonTypeStr = flags.seasonType ?? flags.season ?? pos[1];
  const weekStr = flags.week ?? pos[2];

  if (!yearStr || !seasonTypeStr || !weekStr) {
    console.error(
      'Usage: ts-node src/cli/importWeek.ts <year> <seasonType> <week>\n       ts-node src/cli/importWeek.ts --year=2025 --seasonType=2 --week=1'
    );
    process.exit(1);
  }

  const seasonYear: string = yearStr;
  const seasonType = parseInt(seasonTypeStr, 10) as SeasonType;
  const week = parseInt(weekStr, 10);

  const result = await importWeekService.run({ seasonYear, seasonType, week });

  console.log(
    `✅ Imported week ${week} (seasonType ${seasonType}) for ${seasonYear} — upserts=${result.upserts}, skipped=${result.skipped}`
  );

  if (result.scoreChanges && result.scoreChanges.length > 0) {
    console.log('\n🏈 Score updates this week:');
    for (const g of result.scoreChanges) {
      console.log(`${g.homeTeam}: ${g.homeScore} -vs- ${g.awayTeam}: ${g.awayScore}`);
    }
    console.log('');
  } else {
    console.log('\n(No score changes detected.)\n');
  }
}

main().catch((err) => {
  console.error('❌ importWeek failed:', err);
  process.exit(1);
});
