import { Prospect } from './prospect.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * Prospect Repository Interface
 * Defines the contract for prospect data access
 */
export interface ProspectRepository {
  /**
   * Find a prospect by id
   */
  findById(id: number): Promise<Result<Prospect | null>>;

  /**
   * Find all prospects
   */
  findAll(limit?: number, offset?: number): Promise<Result<Prospect[]>>;

  /**
   * Find prospects by filters
   */
  findByFilters(
    filters: Partial<{
      position: string;
      college: string;
      drafted: boolean;
      draftYear: number;
      teamId: number;
    }>,
  ): Promise<Result<Prospect[]>>;

  /**
   * Create a new prospect
   */
  create(prospect: Prospect): Promise<Result<Prospect>>;

  /**
   * Update an existing prospect
   */
  update(id: number, prospect: Prospect): Promise<Result<Prospect>>;

  /**
   * Delete a prospect
   */
  delete(id: number): Promise<Result<boolean>>;

  /**
   * Find prospects by position
   */
  findByPosition(position: string): Promise<Result<Prospect[]>>;

  /**
   * Find prospects by college
   */
  findByCollege(college: string): Promise<Result<Prospect[]>>;

  /**
   * Find drafted prospects by team
   */
  findByTeam(teamId: number): Promise<Result<Prospect[]>>;

  /**
   * Find prospects by draft year
   */
  findByDraftYear(draftYear: number): Promise<Result<Prospect[]>>;

  /**
   * Find undrafted prospects
   */
  findUndrafted(): Promise<Result<Prospect[]>>;

  /**
   * Find a prospect by draft pick
   */
  findByDraftPick(draftPickId: number): Promise<Result<Prospect | null>>;

  /**
   * Search prospects by name
   */
  searchByName(name: string): Promise<Result<Prospect[]>>;
}
