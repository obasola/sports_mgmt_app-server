// src/domain/team/value-objects/TeamDivision.ts
import { ValidationError } from '../../../shared/errors/AppError';

export class TeamDivision {
  constructor(
    public readonly conference?: string,
    public readonly division?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.conference && this.conference.length > 45) {
      throw new ValidationError('Conference cannot exceed 45 characters');
    }
    if (this.division && this.division.length > 45) {
      throw new ValidationError('Division cannot exceed 45 characters');
    }
  }

  public getFormattedDivision(): string {
    const parts: string[] = [];
    
    if (this.conference?.trim()) {
      parts.push(this.conference.trim());
    }
    
    if (this.division?.trim()) {
      parts.push(this.division.trim());
    }
    
    return parts.length > 0 ? parts.join(' - ') : '';
  }

  public equals(other: TeamDivision): boolean {
    return (
      this.conference === other.conference &&
      this.division === other.division
    );
  }

  public isEmpty(): boolean {
    return !this.conference?.trim() && !this.division?.trim();
  }
}