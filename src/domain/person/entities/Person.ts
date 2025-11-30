// src/domain/person/entities/Person.ts
import { ValidationError } from "@/shared/errors/AppError";

export type PersonProps = {
  pid?: number | undefined;
  userName: string;
  emailAddress: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  rid: number | null;
  isActive: boolean;
  emailVerified: boolean;
  verifiedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
};

// What the application supplies when creating a new person
// NOTE: this expects a *hashed* password
export type NewPersonInput = {
  userName: string;
  emailAddress: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  rid?: number | null;
};

export class Person {
  private constructor(private props: PersonProps) {
    this.validate();
  }

  static create(input: NewPersonInput): Person {
    return new Person({
      pid: undefined,
      userName: input.userName.trim(),
      emailAddress: input.emailAddress.trim(),
      passwordHash: input.passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      rid: input.rid ?? 1, // sensible default (adjust to your rules)
      isActive: true,

      emailVerified: false,
      verifiedAt: null,

      createdAt: null, // DB will set; we keep nullable in domain
      updatedAt: null,
      lastLoginAt: null,
    });
  }

  // fromPersistence MUST match actual Prisma return types
  static fromPersistence(row: {
    pid: number | undefined;
    userName: string;
    emailAddress: string;
    passwordHash: string | null;
    firstName: string;
    lastName: string;
    rid: number | null;
    isActive: boolean | null;
    emailVerified: boolean | null;
    verifiedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lastLoginAt: Date | null;
  }): Person {
    return new Person({
      pid: row.pid,
      userName: row.userName,
      emailAddress: row.emailAddress,
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      rid: row.rid,
      isActive: row.isActive ?? true,
      emailVerified: row.emailVerified ?? false,
      verifiedAt: row.verifiedAt,
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
      lastLoginAt: row.lastLoginAt ?? null,
    });
  }

  private validate(): void {
    if (!this.props.userName || this.props.userName.trim().length === 0) {
      throw new ValidationError("Username is required");
    }
    if (this.props.userName.length > 25) {
      throw new ValidationError("Username cannot exceed 25 characters");
    }

    if (!this.props.emailAddress || this.props.emailAddress.trim().length === 0) {
      throw new ValidationError("Email address is required");
    }
    if (this.props.emailAddress.length > 75) {
      throw new ValidationError("Email address cannot exceed 75 characters");
    }
    if (!this.isValidEmail(this.props.emailAddress)) {
      throw new ValidationError("Invalid email format");
    }

    if (!this.props.firstName || this.props.firstName.trim().length === 0) {
      throw new ValidationError("First name is required");
    }
    if (this.props.firstName.length > 25) {
      throw new ValidationError("First name cannot exceed 25 characters");
    }

    if (!this.props.lastName || this.props.lastName.trim().length === 0) {
      throw new ValidationError("Last name is required");
    }
    if (this.props.lastName.length > 35) {
      throw new ValidationError("Last name cannot exceed 35 characters");
    }

    // For brand-new entities, ensure we actually have a password hash
    if (
      this.props.pid === undefined &&
      (!this.props.passwordHash || this.props.passwordHash.trim().length === 0)
    ) {
      throw new ValidationError("Password hash is required");
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

  public get passwordHash(): string | null {
    return this.props.passwordHash;
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  public get rid(): number | null {
    return this.props.rid;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  public get verifiedAt(): Date | null {
    return this.props.verifiedAt;
  }

  public get createdAt(): Date | null {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  public get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  // Business methods
  public updateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new ValidationError("First name is required");
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationError("Last name is required");
    }

    this.props.firstName = firstName.trim();
    this.props.lastName = lastName.trim();
    this.validate();
  }

  public updateEmailAddress(emailAddress: string): void {
    if (!emailAddress || emailAddress.trim().length === 0) {
      throw new ValidationError("Email address is required");
    }

    this.props.emailAddress = emailAddress.trim();
    this.validate();
  }

  public updateUserName(userName: string): void {
    if (!userName || userName.trim().length === 0) {
      throw new ValidationError("Username is required");
    }

    this.props.userName = userName.trim();
    this.validate();
  }

  public updatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new ValidationError("Password is required");
    }

    this.props.passwordHash = password.trim();
    this.validate();
  }

  // Set hashed password (hashing is done outside, by PasswordHasher)
  public setPasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new ValidationError("Password hash is required");
    }
    this.props.passwordHash = passwordHash;
  }

  public markEmailVerified(at: Date = new Date()): void {
    this.props.emailVerified = true;
    this.props.verifiedAt = at;
  }

  public recordLogin(at: Date = new Date()): void {
    this.props.lastLoginAt = at;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public getFullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  // Convert entity back to a persistence-ready shape (Prisma input)
  public toPersistence(): {
    pid: number | undefined;
    userName: string;
    emailAddress: string;
    passwordHash: string | null;
    firstName: string;
    lastName: string;
    rid: number | null;
    isActive: boolean;
    emailVerified: boolean;
    verifiedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lastLoginAt: Date | null;
  } {
    return {
      pid: this.props.pid,
      userName: this.props.userName,
      emailAddress: this.props.emailAddress,
      passwordHash: this.props.passwordHash,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      rid: this.props.rid,
      isActive: this.props.isActive,
      emailVerified: this.props.emailVerified,
      verifiedAt: this.props.verifiedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      lastLoginAt: this.props.lastLoginAt,
    };
  }

  public checkPassword(password: string): boolean {
    return this.passwordHash === password ? true : false;
  }
  public equals(other: Person): boolean {
    return this.props.pid === other.pid;
  }
}
