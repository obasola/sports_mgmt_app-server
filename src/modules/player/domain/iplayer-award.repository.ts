import { PlayerAward } from './player-award.entity';

// src/modules/playerAward/domain/IPlayerAwardRepository.ts
export interface IPlayerAwardRepository {
  findAll(): Promise<PlayerAward[]>;
  findById(id: number): Promise<PlayerAward | null>;
  findByPlayerId(playerId: number): Promise<PlayerAward[]>;
  findByAwardName(awardName: string): Promise<PlayerAward[]>;
  findByYear(year: number): Promise<PlayerAward[]>;
  create(data: PlayerAward): Promise<PlayerAward>;
  update(id: number, data: Partial<PlayerAward>): Promise<PlayerAward>;
  delete(id: number): Promise<void>;
}
