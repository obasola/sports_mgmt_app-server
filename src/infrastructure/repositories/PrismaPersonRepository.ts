// src/infrastructure/repositories/PrismaPersonRepository.ts
import { IPersonRepository, PersonFilters } from '@/domain/person/repositories/IPersonRepository';
import { Person } from '@/domain/person/entities/Person';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaPersonRepository implements IPersonRepository {
  async save(person: Person): Promise<Person> {
    const data = person.toPersistence();
    const { pid, ...createData } = data;

    const savedPerson = await prisma.person.create({
      data: createData,
    });

    return Person.fromPersistence(savedPerson);
  }

  async findById(pid: number): Promise<Person | null> {
    const person = await prisma.person.findUnique({
      where: { pid },
    });

    return person ? Person.fromPersistence(person) : null;
  }

  async findByUserName(userName: string): Promise<Person | null> {
    const person = await prisma.person.findFirst({
      where: { 
        userName: {
          equals: userName,
        }
      },
    });

    return person ? Person.fromPersistence(person) : null;
  }

  async findByEmailAddress(emailAddress: string): Promise<Person | null> {
    const person = await prisma.person.findFirst({
      where: { 
        emailAddress: {
          equals: emailAddress,
        }
      },
    });

    return person ? Person.fromPersistence(person) : null;
  }

  async findAll(
    filters?: PersonFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Person>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
      }),
      prisma.person.count({ where }),
    ]);

    return {
      data: persons.map((person) => Person.fromPersistence(person)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(pid: number, person: Person): Promise<Person> {
    const exists = await this.exists(pid);
    if (!exists) {
      throw new NotFoundError('Person', pid);
    }

    const data = person.toPersistence();
    const { pid: _, ...updateData } = data;

    const updatedPerson = await prisma.person.update({
      where: { pid },
      data: updateData,
    });

    return Person.fromPersistence(updatedPerson);
  }

  async delete(pid: number): Promise<void> {
    const exists = await this.exists(pid);
    if (!exists) {
      throw new NotFoundError('Person', pid);
    }

    await prisma.person.delete({
      where: { pid },
    });
  }

  async exists(pid: number): Promise<boolean> {
    const count = await prisma.person.count({
      where: { pid },
    });
    return count > 0;
  }

  async existsByUserName(userName: string): Promise<boolean> {
    const count = await prisma.person.count({
      where: { 
        userName: {
          equals: userName,
        }
      },
    });
    return count > 0;
  }

  async existsByEmailAddress(emailAddress: string): Promise<boolean> {
    const count = await prisma.person.count({
      where: { 
        emailAddress: {
          equals: emailAddress,
        }
      },
    });
    return count > 0;
  }

  async searchByName(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResponse<Person>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          userName: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
      }),
      prisma.person.count({ where }),
    ]);

    return {
      data: persons.map((person) => Person.fromPersistence(person)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private buildWhereClause(filters?: PersonFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.userName) {
      where.userName = { contains: filters.userName, mode: 'insensitive' };
    }

    if (filters.emailAddress) {
      where.emailAddress = { contains: filters.emailAddress, mode: 'insensitive' };
    }

    if (filters.firstName) {
      where.firstName = { contains: filters.firstName, mode: 'insensitive' };
    }

    if (filters.lastName) {
      where.lastName = { contains: filters.lastName, mode: 'insensitive' };
    }

    return where;
  }
}