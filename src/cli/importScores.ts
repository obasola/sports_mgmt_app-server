// /src/cli/importScores.ts
/* eslint-disable no-console */
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { importWeekService } from "../infrastructure/dependencies";

type SeasonType = 1 | 2 | 3;


(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("seasonType", { type: "number", demandOption: true, description: "1=pre, 2=reg, 3=post" })
    .option("week",       { type: "number", demandOption: true, description: "Week number (1-20)" })
    .strict()
    .parse();

  const seasonType = Number(argv.seasonType) as SeasonType;
  const week = Number(argv.week);

  // ...parse args you already have...
  try {
    console.time("importScores");
    const res = await importWeekService.run({ seasonType, week });
    console.timeEnd("importScores");
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err: any) {
    console.error("import failed:", err?.message ?? err);
    process.exit(1);
  }
})();

