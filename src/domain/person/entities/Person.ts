// src/domain/person/entities/Person.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface PersonProps {
  pid?: number;
  userName: string;
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class Person {
  private constructor(private props: PersonProps) {
    this.validate();
  }

  public static create(props: PersonProps): Person {
    return new Person(props);
  }

  // 🚨 CRITICAL: fromPersistence MUST match actual Prisma return types
  public static fromPersistence(data: {
    pid: number;
    userName: string;
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Person {
    return new Person({
      pid: data.pid,
      userName: data.userName,
      emailAddress: data.emailAddress,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  }

  private validate(): void {
    if (!this.props.userName || this.props.userName.trim().length === 0) {
      throw new ValidationError('Username is required');
    }
    if (this.props.userName.length > 25) {
      throw new ValidationError('Username cannot exceed 25 characters');
    }
    
    if (!this.props.emailAddress || this.props.emailAddress.trim().length === 0) {
      throw new ValidationError('Email address is required');
    }
    if (this.props.emailAddress.length > 75) {
      throw new ValidationError('Email address cannot exceed 75 characters');
    }
    if (!this.isValidEmail(this.props.emailAddress)) {
      throw new ValidationError('Invalid email format');
    }
    
    if (!this.props.password || this.props.password.trim().length === 0) {
      throw new ValidationError('Password is required');
    }
    if (this.props.password.length > 25) {
      throw new ValidationError('Password cannot exceed 25 characters');
    }
    
    if (!this.props.firstName || this.props.firstName.trim().length === 0) {
      throw new ValidationError('First name is required');
    }
    if (this.props.firstName.length > 25) {
      throw new ValidationError('First name cannot exceed 25 characters');
    }
    
    if (!this.props.lastName || this.props.lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }
    if (this.props.lastName.length > 35) {
      throw new ValidationError('Last name cannot exceed 35 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters
  public get pid(): number | undefined {
    return this.props.pid;
  }

  public get userName(): string {
    return this.props.userName;
  }

  public get emailAddress(): string {
    return this.props.emailAddress;
  }

  public get password(): string {
    return this.props.password;
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  // Business methods
  public updateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new ValidationError('First name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }
    
    this.props.firstName = firstName.trim();
    this.props.lastName = lastName.trim();
    this.validate();
  }

  public updateEmailAddress(emailAddress: string): void {
    if (!emailAddress || emailAddress.trim().length === 0) {
      throw new ValidationError('Email address is required');
    }
    
    this.props.emailAddress = emailAddress.trim();
    this.validate();
  }

  public updatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new ValidationError('Password is required');
    }
    
    this.props.password = password;
    this.validate();
  }

  public updateUserName(userName: string): void {
    if (!userName || userName.trim().length === 0) {
      throw new ValidationError('Username is required');
    }
    
    this.props.userName = userName.trim();
    this.validate();
  }

  public getFullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  public checkPassword(candidatePassword: string): boolean {
    // In a real application, you would hash the password and compare hashes
    // This is just for demonstration purposes
    return this.props.password === candidatePassword;
  }

  // 🔧 toPersistence: Convert entity back to Prisma format
  public toPersistence(): {
    pid?: number;
    userName: string;
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
  } {
    return {
      pid: this.props.pid,
      userName: this.props.userName,
      emailAddress: this.props.emailAddress,
      password: this.props.password,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
    };
  }

  public equals(other: Person): boolean {
    return this.props.pid === other.props.pid;
  }
}