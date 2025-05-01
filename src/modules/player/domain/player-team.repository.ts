import { PlayerTeam } from './player-team.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * PlayerTeam Repository Interface
 * Defines the contract for player-team relationship data access
 */
export interface PlayerTeamRepository {
  /**
   * Find a player-team relationship by id
   */
  findById(id: number): Promise<Result<PlayerTeam | null>>;

  /**
   * Find all player-team relationships for a player
   */
  findByPlayerId(playerId: number): Promise<Result<PlayerTeam[]>>;

  /**
   * Find all player-team relationships for a team
   */
  findByTeamId(teamId: number): Promise<Result<PlayerTeam[]>>;

  /**
   * Find the current team for a player
   */
  findCurrentTeamForPlayer(playerId: number): Promise<Result<PlayerTeam | null>>;

  /**
   * Find all current players for a team
   */
  findCurrentPlayersForTeam(teamId: number): Promise<Result<PlayerTeam[]>>;

  /**
   * Create a new player-team relationship
   */
  create(playerTeam: PlayerTeam): Promise<Result<PlayerTeam>>;

  /**
   * Update an existing player-team relationship
   */
  update(id: number, playerTeam: PlayerTeam): Promise<Result<PlayerTeam>>;

  /**
   * Delete a player-team relationship
   */
  delete(id: number): Promise<Result<boolean>>;
}
