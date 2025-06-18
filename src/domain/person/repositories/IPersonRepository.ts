// src/domain/person/repositories/IPersonRepository.ts
import { Person } from '../entities/Person';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface PersonFilters {
  userName?: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
}

export interface IPersonRepository {
  save(person: Person): Promise<Person>;
  findById(pid: number): Promise<Person | null>;
  findByUserName(userName: string): Promise<Person | null>;
  findByEmailAddress(emailAddress: string): Promise<Person | null>;
  findAll(filters?: PersonFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Person>>;
  update(pid: number, person: Person): Promise<Person>;
  delete(pid: number): Promise<void>;
  exists(pid: number): Promise<boolean>;
  existsByUserName(userName: string): Promise<boolean>;
  existsByEmailAddress(emailAddress: string): Promise<boolean>;
  searchByName(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResponse<Person>>;
}