import { Person } from './person.entity';
import { Result } from '../../../shared/domain/Result';

/**
 * Person Repository Interface
 * Defines the contract for person data access
 */
export interface PersonRepository {
  /**
   * Find a person by id
   */
  findById(pid: number): Promise<Result<Person | null>>;

  /**
   * Find a person by username
   */
  findByUsername(userName: string): Promise<Result<Person | null>>;

  /**
   * Find a person by email
   */
  findByEmail(emailAddress: string): Promise<Result<Person | null>>;

  /**
   * Find all persons
   */
  findAll(limit?: number, offset?: number): Promise<Result<Person[]>>;

  /**
   * Create a new person
   */
  create(person: Person): Promise<Result<Person>>;

  /**
   * Update an existing person
   */
  update(pid: number, person: Person): Promise<Result<Person>>;

  /**
   * Delete a person
   */
  delete(pid: number): Promise<Result<boolean>>;
}
