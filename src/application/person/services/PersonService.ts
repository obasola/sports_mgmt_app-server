// src/application/person/services/PersonService.ts
import { IPersonRepository } from '@/domain/person/repositories/IPersonRepository';
import { Person } from '@/domain/person/entities/Person';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreatePersonDto,
  UpdatePersonDto,
  PersonFiltersDto,
  PersonResponseDto,
  LoginDto,
  LoginResponseDto,
} from '../dto/PersonDto';
import { PersonMapper } from '@/domain/person/mapper/PersonMapper';
import { PersonProps } from '@/domain/person/dtos/PersonDTO';


export interface LoginRequest {
  userName: string
  password: string
}

export interface RegisterRequest {
  userName: string
  emailAddress: string
  password: string
  firstName: string
  lastName: string
}

export interface PersonResponse {
  pid: number
  userName: string
  emailAddress: string
  firstName: string
  lastName: string
  fullName: string
}

export interface LoginResponse {
  success: boolean
  person: PersonResponse
  message: string
}

export class PersonService {
  constructor(private readonly personRepository: IPersonRepository) {}

//*************************************************************************

  async login(dto: LoginRequest): Promise<LoginResponseDto> {
    // Find person by username
    const person = await this.personRepository.findByUserName(dto.userName);
    if (!person) {
      throw new ValidationError('Invalid username or password');
    }

    // Check password (in real app, compare hashed passwords)
    if (!person.checkPassword(dto.password)) {
      throw new ValidationError('Invalid username or password');
    }

    return {
      success: true,
      person: this.toResponseDto(person),
      message: 'Login successful',
    };
  }

  async register(userData: RegisterRequest): Promise<PersonResponse> {
    return this.createPerson(userData);
  }

  async checkUserNameExists(userName: string): Promise<PersonResponseDto> {
    return this.getPersonByUserName(userName);
  }

  async checkEmailExists(emailAddress: string): Promise<PersonResponseDto> {
    return this.getPersonByEmailAddress(emailAddress);
  }

  //*************************************************************************
  async createPerson(dto: CreatePersonDto): Promise<PersonResponseDto> {
    // Check if username already exists
    const existingUserName = await this.personRepository.findByUserName(dto.userName);
    if (existingUserName) {
      throw new ConflictError(`Username ${dto.userName} already exists`);
    }

    // Check if email already exists
    const existingEmail = await this.personRepository.findByEmail(dto.emailAddress);
    if (existingEmail) {
      throw new ConflictError(`Email address ${dto.emailAddress} already exists`);
    }

    const person = Person.create({
      userName: dto.userName,
      emailAddress: dto.emailAddress,
      passwordHash: dto.password, // In real app, hash the password before storing
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const savedPerson = await this.personRepository.createPerson(PersonMapper.mapPersonToNewPersonInput(person));
    return this.toResponseDto(savedPerson);
  }

  async getPersonById(pid: number): Promise<PersonResponseDto> {
    const person = await this.personRepository.findById(pid);
    if (!person) {
      throw new NotFoundError('Person', pid);
    }
    return this.toResponseDto(person);
  }

  async getPersonByUserName(userName: string): Promise<PersonResponseDto> {
    const person = await this.personRepository.findByUserName(userName);
    if (!person) {
      throw new NotFoundError('Person', userName);
    }
    return this.toResponseDto(person);
  }

  async getPersonByEmailAddress(emailAddress: string): Promise<PersonResponseDto> {
    const person = await this.personRepository.findByEmail(emailAddress);
    if (!person) {
      throw new NotFoundError('Person', emailAddress);
    }
    return this.toResponseDto(person);
  }

  async getAllPersons(
    filters?: PersonFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PersonResponseDto>> {
    const result = await this.personRepository.findAll(filters, pagination);
    return {
      data: result.data.map((person) => this.toResponseDto(person)),
      pagination: result.pagination,
    };
  }

  async findByUserName(
    username: string
  ): Promise<PersonProps> {
    const result = await this.personRepository.findByUserName(username);
    return PersonMapper.mapFromDatabaseRow(result);
  }

  async updatePerson(pid: number, dto: UpdatePersonDto): Promise<PersonResponseDto> {
    const existingPerson = await this.personRepository.findById(pid);
    if (!existingPerson) {
      throw new NotFoundError('Person', pid);
    }

    // Check if username already exists (if changing username)
    if (dto.userName && dto.userName !== existingPerson.userName) {
      const personWithUserName = await this.personRepository.findByUserName(dto.userName);
      if (personWithUserName && personWithUserName.pid !== pid) {
        throw new ConflictError(`Username ${dto.userName} already exists`);
      }
    }

    // Check if email already exists (if changing email)
    if (dto.emailAddress && dto.emailAddress !== existingPerson.emailAddress) {
      const personWithEmail = await this.personRepository.findByEmail(dto.emailAddress);
      if (personWithEmail && personWithEmail.pid !== pid) {
        throw new ConflictError(`Email address ${dto.emailAddress} already exists`);
      }
    }

    // Apply updates to existing person
    if (dto.userName) {
      existingPerson.updateUserName(dto.userName);
    }

    if (dto.emailAddress) {
      existingPerson.updateEmailAddress(dto.emailAddress);
    }

    if (dto.password) {
      existingPerson.updatePassword(dto.password); // In real app, hash the password
    }

    if (dto.firstName && dto.lastName) {
      existingPerson.updateName(dto.firstName, dto.lastName);
    } else if (dto.firstName) {
      existingPerson.updateName(dto.firstName, existingPerson.lastName);
    } else if (dto.lastName) {
      existingPerson.updateName(existingPerson.firstName, dto.lastName);
    }

    const updatedPerson = await this.personRepository.updatePerson(existingPerson);
    return this.toResponseDto(updatedPerson);
  }

  async deletePerson(pid: number): Promise<void> {
    const person = await this.personRepository.findById(pid);
    if (!person) {
      throw new NotFoundError('Person', pid);
    }

    await this.personRepository.delete(pid);
  }

  async personExists(pid: number): Promise<boolean> {
    return this.personRepository.exists(pid);
  }

  async personExistsByUserName(userName: string): Promise<boolean> {
    return this.personRepository.existsByUserName(userName);
  }

  async personExistsByEmailAddress(emailAddress: string): Promise<boolean> {
    return this.personRepository.existsByEmailAddress(emailAddress);
  }

  private toResponseDto(person: Person): PersonResponseDto {
    return {
      pid: person.pid!,
      userName: person.userName,
      emailAddress: person.emailAddress,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: person.getFullName(),
      // password is intentionally excluded for security
    };
  }
}