// src/application/playoffs/services/PlayoffBracketService.ts
import type { PlayoffBracket } from '@/domain/playoffs/valueObjects/PlayoffBracket';

export interface PlayoffBracketService {
  getBracketForSeason(seasonYear: number): Promise<PlayoffBracket>;
}

