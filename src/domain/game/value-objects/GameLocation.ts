// src/domain/game/value-objects/GameLocation.ts
import { ValidationError } from '@/shared/errors/AppError';

export class GameLocation {
  constructor(
    public readonly venue?: string,
    public readonly city?: string,
    public readonly stateProvince?: string,
    public readonly country?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.venue && this.venue.length > 255) {
      throw new ValidationError('Game venue cannot exceed 255 characters');
    }
    if (this.city && this.city.length > 100) {
      throw new ValidationError('Game city cannot exceed 100 characters');
    }
    if (this.stateProvince && this.stateProvince.length > 100) {
      throw new ValidationError('State/Province cannot exceed 100 characters');
    }
    if (this.country && this.country.length > 50) {
      throw new ValidationError('Country cannot exceed 50 characters');
    }
  }

  public getFullLocation(): string {
    const parts = [this.venue, this.city, this.stateProvince, this.country]
      .filter(part => part && part.trim().length > 0);
    
    return parts.join(', ');
  }

  public isComplete(): boolean {
    return !!(this.venue && this.city && this.stateProvince && this.country);
  }

  public equals(other: GameLocation): boolean {
    return (
      this.venue === other.venue &&
      this.city === other.city &&
      this.stateProvince === other.stateProvince &&
      this.country === other.country
    );
  }
}