import { Team } from './team.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * Team Repository Interface
 * Defines the contract for team data access
 */
export interface TeamRepository {
  /**
   * Find a team by id
   */
  findById(id: number): Promise<Result<Team | null>>;

  /**
   * Find all teams
   */
  findAll(): Promise<Result<Team[]>>;

  /**
   * Find teams by filters
   */
  findByFilters(filters: Partial<{
    conference: string;
    division: string;
  }>): Promise<Result<Team[]>>;

  /**
   * Create a new team
   */
  create(team: Team): Promise<Result<Team>>;

  /**
   * Update an existing team
   */
  update(id: number, team: Team): Promise<Result<Team>>;

  /**
   * Delete a team
   */
  delete(id: number): Promise<Result<boolean>>;

  /**
   * Find team by name
   */
  findByName(name: string): Promise<Result<Team | null>>;

  /**
   * Find teams by conference and division
   */
  findByConferenceAndDivision(conference: string, division?: string): Promise<Result<Team[]>>;
}
