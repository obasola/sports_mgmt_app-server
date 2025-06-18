// src/domain/player/value-objects/PlayerPhysicals.ts
import { ValidationError } from '@/shared/errors/AppError';

export class PlayerPhysicals {
  constructor(
    public readonly height?: number,
    public readonly weight?: number,
    public readonly handSize?: number,
    public readonly armLength?: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.height !== undefined) {
      if (this.height <= 0 || this.height > 96) { // Max height in inches (8 feet)
        throw new ValidationError('Height must be between 1 and 96 inches');
      }
    }

    if (this.weight !== undefined) {
      if (this.weight <= 0 || this.weight > 500) { // Max reasonable weight in pounds
        throw new ValidationError('Weight must be between 1 and 500 pounds');
      }
    }

    if (this.handSize !== undefined) {
      if (this.handSize <= 0 || this.handSize > 15) { // Max hand size in inches
        throw new ValidationError('Hand size must be between 1 and 15 inches');
      }
    }

    if (this.armLength !== undefined) {
      if (this.armLength <= 0 || this.armLength > 40) { // Max arm length in inches
        throw new ValidationError('Arm length must be between 1 and 40 inches');
      }
    }
  }

  public getHeightFormatted(): string {
    if (!this.height) return '';
    
    const feet = Math.floor(this.height / 12);
    const inches = this.height % 12;
    return `${feet}'${inches}"`;
  }

  public getWeightFormatted(): string {
    if (!this.weight) return '';
    return `${this.weight} lbs`;
  }

  public getHandSizeFormatted(): string {
    if (!this.handSize) return '';
    return `${this.handSize}"`;
  }

  public getArmLengthFormatted(): string {
    if (!this.armLength) return '';
    return `${this.armLength}"`;
  }

  public getBMI(): number | null {
    if (!this.height || !this.weight) return null;
    
    // BMI = weight (lbs) / (height (inches))^2 * 703
    return Math.round((this.weight / (this.height * this.height)) * 703 * 100) / 100;
  }

  public hasCompletePhysicals(): boolean {
    return !!(this.height && this.weight);
  }

  public hasCompleteMeasurements(): boolean {
    return !!(this.height && this.weight && this.handSize && this.armLength);
  }

  public equals(other: PlayerPhysicals): boolean {
    return (
      this.height === other.height &&
      this.weight === other.weight &&
      this.handSize === other.handSize &&
      this.armLength === other.armLength
    );
  }
}