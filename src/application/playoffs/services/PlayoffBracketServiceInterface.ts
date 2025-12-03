// src/application/playoffs/services/PlayoffBracketServiceInterface.ts
import type { PlayoffBracket } from '@/domain/playoffs/valueObjects/PlayoffBracket';

export interface PlayoffBracketService {
  getBracketForSeason(
    seasonYear: number,
    mode?: 'actual' | 'projected'
  ): Promise<PlayoffBracket>;
}

