// src/modules/playerAward/application/playerAward.dto.ts
export interface PlayerAwardDTO {
  id: number;
  playerId: number;
  awardName: string | null;
  yearAwarded: number | null;
}

export interface CreatePlayerAwardDTO {
  playerId: number;
  awardName: string | null;
  yearAwarded: number | null;
}

export interface UpdatePlayerAwardDTO {
  playerId?: number;
  awardName?: string | null;
  yearAwarded?: number | null;
}
