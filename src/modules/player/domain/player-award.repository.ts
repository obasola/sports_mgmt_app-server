import { PlayerAward } from './player-award.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * PlayerAward Repository Interface
 * Defines the contract for player award data access
 */
export interface PlayerAwardRepository {
  /**
   * Find a player award by id
   */
  findById(id: number): Promise<Result<PlayerAward | null>>;

  /**
   * Find all player awards
   */
  findAll(limit?: number, offset?: number): Promise<Result<PlayerAward[]>>;

  /**
   * Find player awards by player id
   */
  findByPlayerId(playerId: number): Promise<Result<PlayerAward[]>>;

  /**
   * Find player awards by award name
   */
  findByAwardName(awardName: string): Promise<Result<PlayerAward[]>>;

  /**
   * Find player awards by year awarded
   */
  findByYearAwarded(yearAwarded: number): Promise<Result<PlayerAward[]>>;

  /**
   * Find player awards by player id and award name
   */
  findByPlayerIdAndAwardName(playerId: number, awardName: string): Promise<Result<PlayerAward[]>>;

  /**
   * Create a new player award
   */
  create(playerAward: PlayerAward): Promise<Result<PlayerAward>>;

  /**
   * Update an existing player award
   */
  update(id: number, playerAward: PlayerAward): Promise<Result<PlayerAward>>;

  /**
   * Delete a player award
   */
  delete(id: number): Promise<Result<boolean>>;
}
