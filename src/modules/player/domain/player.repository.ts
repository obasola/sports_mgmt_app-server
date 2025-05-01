import { Player } from './player.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * Player Repository Interface
 * Defines the contract for player data access
 */
export interface PlayerRepository {
  /**
   * Find a player by id
   */
  findById(id: number): Promise<Result<Player | null>>;

  /**
   * Find all players
   */
  findAll(limit?: number, offset?: number): Promise<Result<Player[]>>;

  /**
   * Find players by filters
   */
  findByFilters(filters: Partial<{
    position: string;
    university: string;
    status: string;
    ageMin: number;
    ageMax: number;
  }>): Promise<Result<Player[]>>;

  /**
   * Create a new player
   */
  create(player: Player): Promise<Result<Player>>;

  /**
   * Update an existing player
   */
  update(id: number, player: Player): Promise<Result<Player>>;

  /**
   * Delete a player
   */
  delete(id: number): Promise<Result<boolean>>;
  
  /**
   * Find players for a specific team
   */
  findByTeamId(teamId: number): Promise<Result<Player[]>>;
}