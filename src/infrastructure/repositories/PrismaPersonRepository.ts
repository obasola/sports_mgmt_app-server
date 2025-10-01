import { IPersonRepository, PersonFilters } from '@/domain/person/repositories/IPersonRepository';
import { Person } from '@/domain/person/entities/Person';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

type DbPerson = {
  pid: number;
  userName: string;
  emailAddress: string;
  password: string;         // non-null in DB
  firstName: string;
  lastName: string;
};

// Expand DB → Domain shape by filling missing optional fields with nulls.
function toDomainShape(p: DbPerson) {
  return Person.fromPersistence({
    pid: p.pid,
    userName: p.userName,
    emailAddress: p.emailAddress,
    password: p.password ?? '',     // domain may allow null; DB does not
    firstName: p.firstName,
    lastName: p.lastName,
    // add any optional fields your domain constructor expects:
    rid: null,
    isActive: null,
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
  } as any);
}

export class PrismaPersonRepository implements IPersonRepository {
  async save(person: Person): Promise<Person> {
    const data = person.toPersistence();

    const created = await prisma.person.create({
      data: {
        userName: data.userName!,
        emailAddress: data.emailAddress!,
        // DB requires string, never null
        password: (data.password ?? '').toString(),
        firstName: data.firstName!,
        lastName: data.lastName!,
      },
    });

    return toDomainShape(created as DbPerson);
  }

  async findById(pid: number): Promise<Person | null> {
    const p = await prisma.person.findUnique({ where: { pid } });
    return p ? toDomainShape(p as DbPerson) : null;
  }

  async findByUserName(userName: string): Promise<Person | null> {
    const p = await prisma.person.findFirst({ where: { userName: { equals: userName } } });
    return p ? toDomainShape(p as DbPerson) : null;
  }

  async findByEmailAddress(emailAddress: string): Promise<Person | null> {
    const p = await prisma.person.findFirst({ where: { emailAddress: { equals: emailAddress } } });
    return p ? toDomainShape(p as DbPerson) : null;
  }

  async findAll(filters?: PersonFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Person>> {
    const page  = pagination?.page  ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip  = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [rows, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.person.count({ where }),
    ]);

    return {
      data: rows.map(r => toDomainShape(r as DbPerson)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async update(pid: number, person: Person): Promise<Person> {
    const exists = await this.exists(pid);
    if (!exists) throw new NotFoundError('Person', pid);

    const data = person.toPersistence();

    const updated = await prisma.person.update({
      where: { pid },
      data: {
        userName:    data.userName ?? undefined,
        emailAddress:data.emailAddress ?? undefined,
        // if domain gives null, don’t write null into a NOT NULL column
        password:    data.password != null ? data.password.toString() : undefined,
        firstName:   data.firstName ?? undefined,
        lastName:    data.lastName ?? undefined,
      },
    });

    return toDomainShape(updated as DbPerson);
  }

  async delete(pid: number): Promise<void> {
    const exists = await this.exists(pid);
    if (!exists) throw new NotFoundError('Person', pid);
    await prisma.person.delete({ where: { pid } });
  }

  async exists(pid: number): Promise<boolean> {
    const count = await prisma.person.count({ where: { pid } });
    return count > 0;
  }

  async existsByUserName(userName: string): Promise<boolean> {
    const count = await prisma.person.count({ where: { userName: { equals: userName } } });
    return count > 0;
  }

  async existsByEmailAddress(emailAddress: string): Promise<boolean> {
    const count = await prisma.person.count({ where: { emailAddress: { equals: emailAddress } } });
    return count > 0;
  }

  async searchByName(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResponse<Person>> {
    const page  = pagination?.page  ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip  = (page - 1) * limit;

    const where = {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' as const } },
        { lastName:  { contains: searchTerm, mode: 'insensitive' as const } },
        { userName:  { contains: searchTerm, mode: 'insensitive' as const } },
      ],
    };

    const [rows, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.person.count({ where }),
    ]);

    return {
      data: rows.map(r => toDomainShape(r as DbPerson)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  private buildWhereClause(filters?: PersonFilters): object {
    if (!filters) return {};
    const where: Record<string, unknown> = {};
    if (filters.userName)    where.userName    = { contains: filters.userName,    mode: 'insensitive' };
    if (filters.emailAddress)where.emailAddress= { contains: filters.emailAddress,mode: 'insensitive' };
    if (filters.firstName)   where.firstName   = { contains: filters.firstName,   mode: 'insensitive' };
    if (filters.lastName)    where.lastName    = { contains: filters.lastName,    mode: 'insensitive' };
    return where;
  }
}
