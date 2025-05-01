import { DraftPick } from './draft-pick.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * DraftPick Repository Interface
 * Defines the contract for draft pick data access
 */
export interface DraftPickRepository {
  /**
   * Find a draft pick by id
   */
  findById(id: number): Promise<Result<DraftPick | null>>;

  /**
   * Find all draft picks
   */
  findAll(limit?: number, offset?: number): Promise<Result<DraftPick[]>>;

  /**
   * Find draft picks by filters
   */
  findByFilters(
    filters: Partial<{
      round: number;
      pickNumber: number;
      draftYear: number;
      currentTeamId: number;
      used: boolean;
      originalTeam: number;
    }>,
  ): Promise<Result<DraftPick[]>>;

  /**
   * Create a new draft pick
   */
  create(draftPick: DraftPick): Promise<Result<DraftPick>>;

  /**
   * Update an existing draft pick
   */
  update(id: number, draftPick: DraftPick): Promise<Result<DraftPick>>;

  /**
   * Delete a draft pick
   */
  delete(id: number): Promise<Result<boolean>>;

  /**
   * Find draft picks by draft year
   */
  findByDraftYear(draftYear: number): Promise<Result<DraftPick[]>>;

  /**
   * Find draft picks by team
   */
  findByTeam(teamId: number): Promise<Result<DraftPick[]>>;

  /**
   * Find unused draft picks by team
   */
  findUnusedByTeam(teamId: number): Promise<Result<DraftPick[]>>;

  /**
   * Find draft pick by round, pick number, and year
   */
  findByRoundPickYear(
    round: number,
    pickNumber: number,
    draftYear: number,
  ): Promise<Result<DraftPick | null>>;

  /**
   * Find draft picks by prospect ID
   */
  findByProspectId(prospectId: number): Promise<Result<DraftPick | null>>;

  /**
   * Find draft picks by player ID
   */
  findByPlayerId(playerId: number): Promise<Result<DraftPick | null>>;
}
