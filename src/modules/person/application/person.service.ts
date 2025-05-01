import { Person } from '../domain/person.entity';

import { Result } from '../../../shared/domain/Result';
import * as crypto from 'crypto';
import { PersonPrismaRepository } from '../infrastructure/persistence/person.prisma.repository';

export class PersonService {
  private readonly personRepository: PersonPrismaRepository;

  constructor(personRepository: PersonPrismaRepository) {
    this.personRepository = personRepository;
  }

  /**
   * Get a person by id
   */
  async getPersonById(pid: number): Promise<Result<Person | null>> {
    return await this.personRepository.findById(pid);
  }

  /**
   * Get all persons with optional pagination
   */
  async getAllPersons(limit?: number, offset?: number): Promise<Result<Person[]>> {
    return await this.personRepository.findAll(limit, offset);
  }

  /**
   * Create a new person with hashed password
   */
  async createPerson(personData: {
    userName: string;
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<Result<Person>> {
    // Check if username already exists
    const existingUserResult = await this.personRepository.findByUsername(personData.userName);

    if (existingUserResult.isFailure) {
      return Result.fail<Person>(existingUserResult.error as string);
    }

    const existingUser = existingUserResult.getValue();
    if (existingUser) {
      return Result.fail<Person>('Username already exists');
    }

    // Check if email already exists
    const existingEmailResult = await this.personRepository.findByEmail(personData.emailAddress);

    if (existingEmailResult.isFailure) {
      return Result.fail<Person>(existingEmailResult.error as string);
    }

    const existingEmail = existingEmailResult.getValue();
    if (existingEmail) {
      return Result.fail<Person>('Email address already exists');
    }

    // Hash the password
    const hashedPassword = this.hashPassword(personData.password);

    // Create the person with hashed password
    const personResult = Person.create({
      ...personData,
      password: hashedPassword,
    });

    if (personResult.isFailure) {
      return Result.fail<Person>(personResult.error as string);
    }

    const person = personResult.getValue();
    return await this.personRepository.create(person);
  }

  /**
   * Update an existing person
   */
  async updatePerson(
    pid: number,
    personData: {
      userName?: string;
      emailAddress?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<Result<Person>> {
    // Check if person exists
    const existingPersonResult = await this.personRepository.findById(pid);

    if (existingPersonResult.isFailure) {
      return Result.fail<Person>(existingPersonResult.error as string);
    }

    const existingPerson = existingPersonResult.getValue();
    if (!existingPerson) {
      return Result.fail<Person>(`Person with ID ${pid} not found`);
    }

    // Check username uniqueness if it's being updated
    if (personData.userName && personData.userName !== existingPerson.userName) {
      const existingUserResult = await this.personRepository.findByUsername(personData.userName);

      if (existingUserResult.isFailure) {
        return Result.fail<Person>(existingUserResult.error as string);
      }

      const existingUser = existingUserResult.getValue();
      if (existingUser) {
        return Result.fail<Person>('Username already exists');
      }
    }

    // Check email uniqueness if it's being updated
    if (personData.emailAddress && personData.emailAddress !== existingPerson.emailAddress) {
      const existingEmailResult = await this.personRepository.findByEmail(personData.emailAddress);

      if (existingEmailResult.isFailure) {
        return Result.fail<Person>(existingEmailResult.error as string);
      }

      const existingEmail = existingEmailResult.getValue();
      if (existingEmail) {
        return Result.fail<Person>('Email address already exists');
      }
    }

    // Update the person entity
    let updatedPerson = existingPerson;

    // Update personal info if provided
    if (personData.firstName || personData.lastName) {
      const firstName = personData.firstName || existingPerson.firstName;
      const lastName = personData.lastName || existingPerson.lastName;

      const updatedPersonResult = updatedPerson.updatePersonalInfo(firstName, lastName);

      if (updatedPersonResult.isFailure) {
        return Result.fail<Person>(updatedPersonResult.error as string);
      }

      updatedPerson = updatedPersonResult.getValue();
    }

    // Update username if provided
    if (personData.userName) {
      const updatedPersonResult = updatedPerson.updateUsername(personData.userName);

      if (updatedPersonResult.isFailure) {
        return Result.fail<Person>(updatedPersonResult.error as string);
      }

      updatedPerson = updatedPersonResult.getValue();
    }

    // Update email if provided
    if (personData.emailAddress) {
      const updatedPersonResult = updatedPerson.updateEmail(personData.emailAddress);

      if (updatedPersonResult.isFailure) {
        return Result.fail<Person>(updatedPersonResult.error as string);
      }

      updatedPerson = updatedPersonResult.getValue();
    }

    // Save the updated person
    return await this.personRepository.update(pid, updatedPerson);
  }

  /**
   * Update a person's password
   */
  async updatePassword(pid: number, password: string): Promise<Result<Person>> {
    // Check if person exists
    const existingPersonResult = await this.personRepository.findById(pid);

    if (existingPersonResult.isFailure) {
      return Result.fail<Person>(existingPersonResult.error as string);
    }

    const existingPerson = existingPersonResult.getValue();
    if (!existingPerson) {
      return Result.fail<Person>(`Person with ID ${pid} not found`);
    }

    // Hash the new password
    const hashedPassword = this.hashPassword(password);

    // Update the password
    const updatedPersonResult = existingPerson.updatePassword(hashedPassword);

    if (updatedPersonResult.isFailure) {
      return Result.fail<Person>(updatedPersonResult.error as string);
    }

    const updatedPerson = updatedPersonResult.getValue();

    // Save the updated person
    return await this.personRepository.update(pid, updatedPerson);
  }

  /**
   * Delete a person by id
   */
  async deletePerson(pid: number): Promise<Result<boolean>> {
    // Check if person exists
    const existingPersonResult = await this.personRepository.findById(pid);

    if (existingPersonResult.isFailure) {
      return Result.fail<boolean>(existingPersonResult.error as string);
    }

    const existingPerson = existingPersonResult.getValue();
    if (!existingPerson) {
      return Result.fail<boolean>(`Person with ID ${pid} not found`);
    }

    return await this.personRepository.delete(pid);
  }

  /**
   * Authenticate a person with username and password
   */
  async authenticatePerson(userName: string, password: string): Promise<Result<Person | null>> {
    // Find person by username
    const personResult = await this.personRepository.findByUsername(userName);

    if (personResult.isFailure) {
      return Result.fail<Person | null>(personResult.error as string);
    }

    const person = personResult.getValue();

    // If no person found or password doesn't match, return null
    if (!person || !this.verifyPassword(password, person.password)) {
      return Result.ok<Person | null>(null);
    }

    return Result.ok<Person | null>(person);
  }

  /**
   * Hash a password using SHA-256
   * Note: In a real application, use a more secure hashing algorithm like bcrypt
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Verify a password against a hash
   */
  private verifyPassword(password: string, hash: string): boolean {
    const hashedPassword = this.hashPassword(password);
    return hashedPassword === hash;
  }
}
