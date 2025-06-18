

// src/domain/player/value-objects/PlayerLocation.ts
import { ValidationError } from '@/shared/errors/AppError';

export class PlayerLocation {
  constructor(
    public readonly homeCity?: string,
    public readonly homeState?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.homeCity && this.homeCity.length > 45) {
      throw new ValidationError('Home city cannot exceed 45 characters');
    }

    if (this.homeState && this.homeState.length > 45) {
      throw new ValidationError('Home state cannot exceed 45 characters');
    }

    // Validate city format if provided
    if (this.homeCity) {
      const cityPattern = /^[a-zA-Z\s\-'\.]+$/;
      if (!cityPattern.test(this.homeCity)) {
        throw new ValidationError('Home city contains invalid characters');
      }
    }

    // Validate state format if provided
    if (this.homeState) {
      const statePattern = /^[a-zA-Z\s\-'\.]+$/;
      if (!statePattern.test(this.homeState)) {
        throw new ValidationError('Home state contains invalid characters');
      }
    }
  }

  public getFormattedLocation(): string {
    if (this.homeCity && this.homeState) {
      return `${this.homeCity}, ${this.homeState}`;
    }
    
    if (this.homeCity) {
      return this.homeCity;
    }
    
    if (this.homeState) {
      return this.homeState;
    }
    
    return '';
  }

  public hasCompleteLocation(): boolean {
    return !!(this.homeCity && this.homeState);
  }

  public equals(other: PlayerLocation): boolean {
    return (
      this.homeCity === other.homeCity &&
      this.homeState === other.homeState
    );
  }
}
