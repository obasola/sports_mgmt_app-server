import { PrismaClient } from '@prisma/client';
import { Person } from '../../domain/person.entity';

import { Result } from '../../../../shared/domain/Result';
import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';
import { PersonRepository } from '../../domain/person.repository';

export class PersonPrismaRepository implements PersonRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient();
  }

  /**
   * Find a person by id
   */
  async findById(pid: number): Promise<Result<Person | null>> {
    try {
      const personData = await this.prisma.person.findUnique({
        where: { pid },
      });

      if (!personData) {
        return Result.ok<Person | null>(null);
      }

      const personResult = Person.create({
        pid: personData.pid,
        userName: personData.userName,
        emailAddress: personData.emailAddress,
        password: personData.password,
        firstName: personData.firstName,
        lastName: personData.lastName,
      });

      if (personResult.isFailure) {
        return Result.fail<Person | null>(personResult.error as string);
      }

      return Result.ok<Person | null>(personResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<Person | null>(`Failed to fetch person: ${(error as Error).message}`);
    }
  }

  /**
   * Find a person by username
   */
  async findByUsername(userName: string): Promise<Result<Person | null>> {
    try {
      const personData = await this.prisma.person.findFirst({
        where: { userName },
      });

      if (!personData) {
        return Result.ok<Person | null>(null);
      }

      const personResult = Person.create({
        pid: personData.pid,
        userName: personData.userName,
        emailAddress: personData.emailAddress,
        password: personData.password,
        firstName: personData.firstName,
        lastName: personData.lastName,
      });

      if (personResult.isFailure) {
        return Result.fail<Person | null>(personResult.error as string);
      }

      return Result.ok<Person | null>(personResult.getValue());
    } catch (error) {
      console.error(`Error in findByUsername: ${(error as Error).message}`);
      return Result.fail<Person | null>(
        `Failed to fetch person by username: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find a person by email
   */
  async findByEmail(emailAddress: string): Promise<Result<Person | null>> {
    try {
      const personData = await this.prisma.person.findFirst({
        where: { emailAddress },
      });

      if (!personData) {
        return Result.ok<Person | null>(null);
      }

      const personResult = Person.create({
        pid: personData.pid,
        userName: personData.userName,
        emailAddress: personData.emailAddress,
        password: personData.password,
        firstName: personData.firstName,
        lastName: personData.lastName,
      });

      if (personResult.isFailure) {
        return Result.fail<Person | null>(personResult.error as string);
      }

      return Result.ok<Person | null>(personResult.getValue());
    } catch (error) {
      console.error(`Error in findByEmail: ${(error as Error).message}`);
      return Result.fail<Person | null>(
        `Failed to fetch person by email: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all persons
   */
  async findAll(limit = 100, offset = 0): Promise<Result<Person[]>> {
    try {
      const personsData = await this.prisma.person.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          lastName: 'asc',
        },
      });

      const persons: Person[] = [];

      for (const personData of personsData) {
        const personResult = Person.create({
          pid: personData.pid,
          userName: personData.userName,
          emailAddress: personData.emailAddress,
          password: personData.password,
          firstName: personData.firstName,
          lastName: personData.lastName,
        });

        if (personResult.isSuccess) {
          persons.push(personResult.getValue());
        }
      }

      return Result.ok<Person[]>(persons);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<Person[]>(`Failed to fetch persons: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new person
   */
  async create(person: Person): Promise<Result<Person>> {
    try {
      const personData = person.toObject();

      // Remove pid if it exists to let the database generate it
      if (personData.pid !== undefined) {
        delete (personData as any).pid;
      }

      const createdPerson = await this.prisma.person.create({
        data: personData,
      });

      const personResult = Person.create({
        pid: createdPerson.pid,
        userName: createdPerson.userName,
        emailAddress: createdPerson.emailAddress,
        password: createdPerson.password,
        firstName: createdPerson.firstName,
        lastName: createdPerson.lastName,
      });

      if (personResult.isFailure) {
        return Result.fail<Person>(personResult.error as string);
      }

      return Result.ok<Person>(personResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<Person>(`Failed to create person: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing person
   */
  async update(pid: number, person: Person): Promise<Result<Person>> {
    try {
      const personData = person.toObject();

      // Ensure the correct ID is used
      delete (personData as any).pid;

      const updatedPerson = await this.prisma.person.update({
        where: { pid },
        data: personData,
      });

      const personResult = Person.create({
        pid: updatedPerson.pid,
        userName: updatedPerson.userName,
        emailAddress: updatedPerson.emailAddress,
        password: updatedPerson.password,
        firstName: updatedPerson.firstName,
        lastName: updatedPerson.lastName,
      });

      if (personResult.isFailure) {
        return Result.fail<Person>(personResult.error as string);
      }

      return Result.ok<Person>(personResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<Person>(`Failed to update person: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a person
   */
  async delete(pid: number): Promise<Result<boolean>> {
    try {
      await this.prisma.person.delete({
        where: { pid },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete person: ${(error as Error).message}`);
    }
  }
}
