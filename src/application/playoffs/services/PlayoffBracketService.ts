// src/application/playoffs/services/PlayoffBracketService.ts
import type { PlayoffBracket } from '@/domain/playoffs/valueObjects/PlayoffBracket';

export interface PlayoffBracketService {
  /**
   * Returns either:
   *  - the actual playoff bracket (real games + projected missing rounds)
   *  - the projected bracket ("if playoffs started today")
   *
   * The mode is chosen by the caller.
   */
  getBracketForSeason(seasonYear: number, mode?: 'actual' | 'projected'): Promise<PlayoffBracket>;
}
