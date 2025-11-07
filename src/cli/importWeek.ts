#!/usr/bin/env ts-node
// server/src/cli/importWeek.ts
import 'module-alias/register'
import { ScoreboardSyncService } from '@/application/scoreboard/services/ScoreboardSyncService'

const [yearArg, typeArg, weekArg] = process.argv.slice(2)

async function main() {
  const [, , yearArg, typeArg, weekArg] = process.argv;
  if (!yearArg || !typeArg || !weekArg) {
    console.error('Usage: ts-node src/cli/importWeek.ts <year> <seasonType> <week>')
    process.exit(1)
  }

  const svc = new ScoreboardSyncService()
  const year = Number(yearArg);
  const seasonType = Number(typeArg) as 1 | 2 | 3;
  const week = Number(weekArg);

  //const result = await svc.runWeek(Number(yearArg), Number(typeArg) as 1 | 2 | 3, Number(weekArg));
  const result = await svc.runWeek({
    seasonYear: String(yearArg),
    seasonType: Number(typeArg) as 1 | 2 | 3,
    week: Number(weekArg),
  });

  await svc.dispose()

  console.log(
    `✅ Imported week ${result.week} (seasonType=${result.seasonType}) of ${result.seasonYear}: processed=${result.processed}, failed=${result.failed}`
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
