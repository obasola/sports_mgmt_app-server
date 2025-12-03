// src/application/playoffs/services/PlayoffBracketService.ts
import type { PlayoffBracket } from '@/domain/playoffs/valueObjects/PlayoffBracket';

export interface PlayoffBracketService {
  /**
   * Build the current playoff bracket view for a given season.
   * This should be driven by the latest standings and any existing
   * playoff games already in the database.
   */
  getBracketForSeason(seasonYear: number): Promise<PlayoffBracket>;
}
