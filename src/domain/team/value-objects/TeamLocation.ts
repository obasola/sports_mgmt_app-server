// src/domain/team/value-objects/TeamLocation.ts
import { ValidationError } from '@/shared/errors/AppError';

export class TeamLocation {
  constructor(
    public readonly city?: string,
    public readonly state?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.city && this.city.length > 45) {
      throw new ValidationError('City cannot exceed 45 characters');
    }
    
    if (this.state && this.state.length > 45) {
      throw new ValidationError('State cannot exceed 45 characters');
    }
    
    // Additional validation for state format (could be state code or full name)
    if (this.state && this.state.length === 2) {
      // Validate state code format
      if (!/^[A-Z]{2}$/.test(this.state)) {
        throw new ValidationError('State code must be 2 uppercase letters');
      }
    }
  }

  public getFormattedLocation(): string {
    if (this.city && this.state) {
      return `${this.city}, ${this.state}`;
    }
    if (this.city) {
      return this.city;
    }
    if (this.state) {
      return this.state;
    }
    return 'Unknown Location';
  }

  public isComplete(): boolean {
    return !!(this.city && this.state);
  }

  public isSameState(other: TeamLocation): boolean {
    return this.state === other.state;
  }

  public equals(other: TeamLocation): boolean {
    return (
      this.city === other.city &&
      this.state === other.state
    );
  }
}