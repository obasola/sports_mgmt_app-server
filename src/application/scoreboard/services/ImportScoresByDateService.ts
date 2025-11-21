// ===============================================
// src/application/scoreboard/services/ImportScoresByDateService.ts
// ===============================================
import { ScoreboardSyncService } from './ScoreboardSyncService';

export class ImportScoresByDateService {
  constructor(private readonly scoreboardSyncService: ScoreboardSyncService) {}

  async run({ date }: { date: string }) {
    console.log('(ImportScoresByDateService) Running scoreboard import for date:', date);
    const result = await this.scoreboardSyncService.runDate({date});
    console.log('(ImportScoresByDateService) result: '+result)
    return result;
  }
}
