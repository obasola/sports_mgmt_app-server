import { CombineScore } from './combine-score.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * CombineScore Repository Interface
 * Defines the contract for combine score data access
 */
export interface CombineScoreRepository {
  /**
   * Find a combine score by id
   */
  findById(id: number): Promise<Result<CombineScore | null>>;

  /**
   * Find combine score by player id
   */
  findByPlayerId(playerId: number): Promise<Result<CombineScore | null>>;

  /**
   * Find all combine scores
   */
  findAll(limit?: number, offset?: number): Promise<Result<CombineScore[]>>;

  /**
   * Find combine scores by filters
   */
  findByFilters(filters: Partial<{
    fortyTimeLessThan: number;
    verticalLeapGreaterThan: number;
    broadJumpGreaterThan: number;
  }>): Promise<Result<CombineScore[]>>;

  /**
   * Create a new combine score
   */
  create(combineScore: CombineScore): Promise<Result<CombineScore>>;

  /**
   * Update an existing combine score
   */
  update(id: number, combineScore: CombineScore): Promise<Result<CombineScore>>;

  /**
   * Delete a combine score
   */
  delete(id: number): Promise<Result<boolean>>;
}
