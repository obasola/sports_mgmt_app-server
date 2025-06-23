// Value Objects
// src/domain/game/value-objects/GameStatus.ts
import { ValidationError } from '@/shared/errors/AppError';

export class GameStatus {
  public static readonly SCHEDULED = 'scheduled';
  public static readonly IN_PROGRESS = 'in_progress';
  public static readonly COMPLETED = 'completed';
  public static readonly CANCELLED = 'cancelled';
  public static readonly POSTPONED = 'postponed';

  private static readonly VALID_STATUSES = [
    GameStatus.SCHEDULED,
    GameStatus.IN_PROGRESS,
    GameStatus.COMPLETED,
    GameStatus.CANCELLED,
    GameStatus.POSTPONED,
  ];

  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!GameStatus.VALID_STATUSES.includes(this.value)) {
      throw new ValidationError(`Invalid game status: ${this.value}`);
    }
  }

  public static create(value: string): GameStatus {
    return new GameStatus(value);
  }

  public isCompleted(): boolean {
    return this.value === GameStatus.COMPLETED;
  }

  public isInProgress(): boolean {
    return this.value === GameStatus.IN_PROGRESS;
  }

  public canUpdateScore(): boolean {
    return this.value === GameStatus.IN_PROGRESS || this.value === GameStatus.COMPLETED;
  }

  public equals(other: GameStatus): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
