// src/domain/player/value-objects/PlayerName.ts
import { ValidationError } from '@/shared/errors/AppError';

export class PlayerName {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new ValidationError('First name is required');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }

    if (this.firstName.length > 45) {
      throw new ValidationError('First name cannot exceed 45 characters');
    }

    if (this.lastName.length > 45) {
      throw new ValidationError('Last name cannot exceed 45 characters');
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (!namePattern.test(this.firstName)) {
      throw new ValidationError('First name contains invalid characters');
    }

    if (!namePattern.test(this.lastName)) {
      throw new ValidationError('Last name contains invalid characters');
    }
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public getLastNameFirst(): string {
    return `${this.lastName}, ${this.firstName}`;
  }

  public getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  public equals(other: PlayerName): boolean {
    return (
      this.firstName === other.firstName &&
      this.lastName === other.lastName
    );
  }
}

