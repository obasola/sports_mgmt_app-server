// src/domain/player/value-objects/PlayerPhysicals.ts
import { ValidationError } from '@/shared/errors/AppError';

export class PlayerPhysicals {
  constructor(
    public readonly height?: number,    // inches, or 6.1 (6'1") or 510 (5'10")
    public readonly weight?: number,    // lbs
    public readonly handSize?: number,  // inches
    public readonly armLength?: number  // inches
  ) {
    this.validate();
  }

  private validate(): void {
    // Validate each field only if present so GET/list routes don't explode.
    this.validateHeight();
    this.validateWeight();
    this.validateHandSize();
    this.validateArmLength();
  }

  /** Accepts several inputs:
   *  - Already-in-inches (48..95) -> returns as-is
   *  - Decimal feet (e.g., 6.1 ≈ 6'1") -> converts using *12, not *10
   *  - Concatenated feet+inches (e.g., 510 -> 5'10")
   */
// Replace your normalizeHeight with this
private normalizeHeight(height: number): number {
  if (height === undefined || height === null) {
    throw new ValidationError('Height value is invalid');
  }

  // 1) Decimal feet (e.g., 6.1 ≈ 6'1")
  if (height > 0 && height < 10) {
    const feet = Math.floor(height);
    const inches = Math.round((height - feet) * 12);
    return feet * 12 + inches;
  }

  // 2) 3-digit concatenated (e.g., 510 => 5'10")
  if (height >= 100 && height <= 799) {
    const feet = Math.floor(height / 100);
    const inches = Math.round(height % 100);
    return feet * 12 + inches;
  }

  // 3) 4-digit "thousands" format: feet * 1000 + inches (e.g., 6011 => 6'11")
  if (height >= 1000 && height <= 8999) {
    const feet = Math.floor(height / 1000);     // 6011 -> 6
    const inches = Math.round(height % 1000);   // 6011 -> 11
    // guard against accidental extra digits like 6,123
    if (inches > 99) {
      throw new ValidationError(`Height value ${height} has too many inch digits`);
    }
    return feet * 12 + inches;
  }

  // 4) Already inches (typical DB-safe form)
  if (height > 0 && height < 200) {
    return Math.round(height);
  }

  // Anything else is very likely junk
  throw new ValidationError(`Height value ${height} appears to be corrupted`);
}


  private validateHeight(): void {
    if (this.height === undefined) return; // optional for read/filter paths

    const total = this.normalizeHeight(this.height);
    if (total < 48 || total > 95) {
      const feet = Math.floor(total / 12);
      const inches = total % 12;
      throw new ValidationError(
        `Height must be between 4'0" and 7'11". Provided: ${feet}'${inches}"`
      );
    }
  }

  private validateWeight(): void {
    if (this.weight === undefined) return;
    if (this.weight <= 0 || this.weight > 500) {
      throw new ValidationError('Weight must be between 1 and 500 pounds');
    }
  }

  private validateHandSize(): void {
    if (this.handSize === undefined) return;               // optional for reads
    const inches = this.normalizeHandSize(this.handSize);  // <- normalize first
    if (inches < 6 || inches > 11) {
      throw new ValidationError('Hand size must be between 6" and 11"');
    }
    // Optionally: store back the normalized value if you want canonicalization
    // (but since fields are readonly, you’d do that at construction/factory time)
  }
  
  private validateArmLength(): void {
    if (this.armLength === undefined) return;
    const inches = this.normalizeArmLength(this.armLength);
    if (inches <= 0 || inches > 40) {
      throw new ValidationError('Arm length must be between 1" and 40"');
    }
  }
  

  private validateFortyTime(time: number): void {
    // keep for future fields; not invoked in constructor
    if (time < 3.5 || time > 6.5) {
      throw new ValidationError('40-yard dash time must be between 3.5 and 6.5 seconds');
    }
  }

  public getHeightFormatted(): string {
    if (this.height === undefined) return '';
    const total = this.normalizeHeight(this.height);
    const feet = Math.floor(total / 12);
    const inches = total % 12;
    return `${feet}'${inches}"`;
  }

  public getWeightFormatted(): string {
    return this.weight === undefined ? '' : `${this.weight} lbs`;
  }

  public getHandSizeFormatted(): string {
    return this.handSize === undefined ? '' : `${this.handSize}"`;
  }

  public getArmLengthFormatted(): string {
    return this.armLength === undefined ? '' : `${this.armLength}"`;
  }

  public getBMI(): number | null {
    if (this.height === undefined || this.weight === undefined) return null;
    const hInches = this.normalizeHeight(this.height);
    return Math.round((this.weight / (hInches * hInches)) * 703 * 100) / 100;
  }

  public hasCompletePhysicals(): boolean {
    return this.height !== undefined && this.weight !== undefined;
  }

  public hasCompleteMeasurements(): boolean {
    return (
      this.height !== undefined &&
      this.weight !== undefined &&
      this.handSize !== undefined &&
      this.armLength !== undefined
    );
  }

  // add helpers
private coerceNumber(n: unknown): number | undefined {
  if (n === undefined || n === null) return undefined;
  const v = Number(n);
  return Number.isFinite(v) ? v : undefined;
}

// Accepts: inches (6..11), tenths (60..110 -> 6.0..11.0), cm (≈15..30),
// or mm (≈150..300). Returns inches to one decimal place.
private normalizeHandSize(value: number): number {
  const v = this.coerceNumber(value);
  if (v === undefined) throw new ValidationError('Hand size value is invalid');

  // already inches, sane
  if (v >= 6 && v <= 11) return Math.round(v * 10) / 10;

  // tenths-encoded inches (e.g., 97 => 9.7")
  if (v >= 60 && v <= 110) return Math.round((v / 10) * 10) / 10;

  // centimeters (rare), e.g., 24.8 cm -> 9.8"
  if (v > 15 && v < 30) return Math.round((v / 2.54) * 10) / 10;

  // millimeters, e.g., 248 mm -> 9.8"
  if (v >= 150 && v <= 300) return Math.round((v / 25.4) * 10) / 10;

  // If the value is 0 or negative, treat as “not provided” for read paths
  if (v <= 0) throw new ValidationError('Hand size value is invalid');

  // Unknown encoding; let the range check below flag it cleanly
  return v;
}

// arm length is commonly ~28–36 inches; support tenths and cm/mm too
private normalizeArmLength(value: number): number {
  const v = this.coerceNumber(value);
  if (v === undefined) throw new ValidationError('Arm length value is invalid');

  // inches
  if (v >= 10 && v <= 50) return Math.round(v * 10) / 10;

  // tenths-encoded inches (e.g., 325 => 32.5")
  if (v >= 100 && v <= 600) return Math.round((v / 10) * 10) / 10;

  // centimeters (e.g., 80–100 cm)
  if (v >= 25 && v <= 130) return Math.round((v / 2.54) * 10) / 10;

  // millimeters (e.g., 800–1000 mm)
  if (v >= 250 && v <= 1300) return Math.round((v / 25.4) * 10) / 10;

  if (v <= 0) throw new ValidationError('Arm length value is invalid');

  return v;
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