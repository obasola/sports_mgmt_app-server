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

// Then in your validation:

  private validate(): void {
     /*   
    if (this.height !== undefined) {
      const normalizedHeight = this.normalizeHeight(this.height);
      if (normalizedHeight <= 0 || normalizedHeight > 96) {
        throw new ValidationError('Height must be between 1 and 96 inches');
      }
    }
    */
    this.validateHeight();
    if (this.weight !== undefined) {
      if (this.weight <= 0 || this.weight > 500) { // Max reasonable weight in pounds
        throw new ValidationError('Weight must be between 1 and 500 pounds');
      }
    }

    this.validateHandSize();

    if (this.armLength !== undefined) {
      if (this.armLength <= 0 || this.armLength > 40) { // Max arm length in inches
        throw new ValidationError('Arm length must be between 1 and 40 inches');
      }
    }
  }

  private normalizeHeight(height: number): number {
    // Handle decimal feet format (6.1 = 6'1")
    if (height > 0 && height < 10) {
      const feet = Math.floor(height);
      const inches = Math.round((height - feet) * 10);
      return feet * 12 + inches;
    }
    
    // Handle concatenated format (510 = 5'10")
    if (height >= 100 && height <= 699) {
      const feet = Math.floor(height / 100);
      const inches = height % 100;
      return feet * 12 + inches;
    }
    
    // Handle obvious errors
    if (height > 1000) {
      throw new ValidationError(`Height value ${height} appears to be corrupted`);
    }
    
    // Return as-is if already in inches
    return height;
  }

  public getHeightFormatted(): string {
    if (!this.height) return '';
    
    const feet = Math.floor(this.height / 12);
    const inches = this.height % 12;
    return `${feet}'${inches}"`;
  }
  private validateHeight(): void {
    let totalInches: number | undefined = this.height;
    
    if(totalInches === undefined) {
      throw new ValidationError('Height must not be undefined');
    }

    // Calculate the number of feet using integer division (Math.floor())
    let feet = Math.floor(totalInches / 12); 

    // Calculate the remaining inches using the modulus operator
    let inches = totalInches % 12;

    // Validate feet range
    if (feet < 4 || feet > 7) {
      throw new ValidationError('Height must be between 4\'0" and 7\'11"'+' Feet: '+feet+' inches: '+inches);
    }
    
    // Validate inches (0-11)
    if (inches < 0 || inches > 11) {
      throw new ValidationError('Inches '+inches+' must be between 0 and 11');
    }
    
    /* Additional sanity check
    const totalInches = feet * 12 + inches;
    if (totalInches < 48 || totalInches > 95) {
      throw new ValidationError('Height must be between 4\'0" and 7\'11"');
    } */
  }

  private validateHandSize(): void {
    let handSize: number | undefined = this.handSize;
    if(handSize === undefined) return;

    if (handSize < 6 || handSize > 11) {
      throw new ValidationError('Hand Size must be between 6\'" and 11\'"');
    }
  }

  private validateFortyTime(time: number): void {
    // 40-yard dash in seconds (typically 4.0 to 6.0)
    if (time < 3.5 || time > 6.5) {
      throw new ValidationError('40-yard dash time must be between 3.5 and 6.5 seconds');
    }
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