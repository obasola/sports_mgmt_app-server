// src/domain/draftpick/entities/DraftPick.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface DraftPickProps {
  id?: number;
  round: number;
  pickNumber: number;
  draftYear: number;
  currentTeamId: number;
  prospectId?: number;
  playerId?: number;
  used: boolean;
  originalTeam?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DraftPick {
  private constructor(private props: DraftPickProps) {
    this.validate();
  }

  public static create(props: DraftPickProps): DraftPick {
    return new DraftPick(props);
  }

  public static fromPersistence(data: {
    id: number;
    round: number;
    pickNumber: number;
    draftYear: number;
    currentTeamId: number;
    prospectId?: number | null;
    playerId?: number | null;
    used: boolean;
    originalTeam?: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): DraftPick {
    return new DraftPick({
      id: data.id,
      round: data.round,
      pickNumber: data.pickNumber,
      draftYear: data.draftYear,
      currentTeamId: data.currentTeamId,
      prospectId: data.prospectId || undefined,
      playerId: data.playerId || undefined,
      used: data.used,
      originalTeam: data.originalTeam || undefined,
      createdAt: data.createdAt || undefined,
      updatedAt: data.updatedAt || undefined,
    });
  }

  private validate(): void {
    if (this.props.round < 1 || this.props.round > 7) {
      throw new ValidationError('Round must be between 1 and 7');
    }

    if (this.props.pickNumber < 1 || this.props.pickNumber > 300) {
      throw new ValidationError('Pick number must be between 1 and 300');
    }

    if (this.props.draftYear < 1990 || this.props.draftYear > 2030) {
      throw new ValidationError('Draft year must be between 1990 and 2030');
    }

    if (this.props.currentTeamId <= 0) {
      throw new ValidationError('Current team ID must be positive');
    }

    if (this.props.originalTeam && this.props.originalTeam <= 0) {
      throw new ValidationError('Original team ID must be positive');
    }

    if (this.props.prospectId && this.props.prospectId <= 0) {
      throw new ValidationError('Prospect ID must be positive');
    }

    if (this.props.playerId && this.props.playerId <= 0) {
      throw new ValidationError('Player ID must be positive');
    }

    // Business rule: Can't have both prospect and player assigned
    if (this.props.prospectId && this.props.playerId) {
      throw new ValidationError('Draft pick cannot have both prospect and player assigned');
    }
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get round(): number {
    return this.props.round;
  }

  public get pickNumber(): number {
    return this.props.pickNumber;
  }

  public get draftYear(): number {
    return this.props.draftYear;
  }

  public get currentTeamId(): number {
    return this.props.currentTeamId;
  }

  public get prospectId(): number | undefined {
    return this.props.prospectId;
  }

  public get playerId(): number | undefined {
    return this.props.playerId;
  }

  public get used(): boolean {
    return this.props.used;
  }

  public get originalTeam(): number | undefined {
    return this.props.originalTeam;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business methods
  public usePick(prospectId: number): void {
    if (this.props.used) {
      throw new ValidationError('Draft pick has already been used');
    }

    if (prospectId <= 0) {
      throw new ValidationError('Prospect ID must be positive');
    }

    this.props.prospectId = prospectId;
    this.props.used = true;
    this.props.updatedAt = new Date();
  }

  public assignPlayer(playerId: number): void {
    if (playerId <= 0) {
      throw new ValidationError('Player ID must be positive');
    }

    // Clear prospect if assigning player
    this.props.prospectId = undefined;
    this.props.playerId = playerId;
    this.props.used = true;
    this.props.updatedAt = new Date();
  }

  public tradeTo(newTeamId: number): void {
    if (newTeamId <= 0) {
      throw new ValidationError('New team ID must be positive');
    }

    if (this.props.used) {
      throw new ValidationError('Cannot trade a used draft pick');
    }

    // Store original team if not already stored
    if (!this.props.originalTeam) {
      this.props.originalTeam = this.props.currentTeamId;
    }

    this.props.currentTeamId = newTeamId;
    this.props.updatedAt = new Date();
  }

  public resetPick(): void {
    this.props.prospectId = undefined;
    this.props.playerId = undefined;
    this.props.used = false;
    this.props.updatedAt = new Date();
  }

  public getPickValue(): number {
    // Simple draft pick value calculation based on round and pick number
    // Higher rounds and later picks have lower values
    const baseValue = 1000;
    const roundPenalty = (this.props.round - 1) * 200;
    const pickPenalty = (this.props.pickNumber - 1) * 5;
    
    return Math.max(baseValue - roundPenalty - pickPenalty, 1);
  }

  public getPickDescription(): string {
    return `Round ${this.props.round}, Pick ${this.props.pickNumber} (${this.props.draftYear})`;
  }

  public isFirstRoundPick(): boolean {
    return this.props.round === 1;
  }

  public isCompensatoryPick(): boolean {
    // Compensatory picks typically come after regular picks in each round
    // This is a simplified check - in reality, compensatory picks have specific ranges
    return this.props.pickNumber > (this.props.round * 32);
  }

  public toPersistence(): {
    id?: number;
    round: number;
    pickNumber: number;
    draftYear: number;
    currentTeamId: number;
    prospectId?: number;
    playerId?: number;
    used: boolean;
    originalTeam?: number;
  } {
    return {
      id: this.props.id,
      round: this.props.round,
      pickNumber: this.props.pickNumber,
      draftYear: this.props.draftYear,
      currentTeamId: this.props.currentTeamId,
      prospectId: this.props.prospectId,
      playerId: this.props.playerId,
      used: this.props.used,
      originalTeam: this.props.originalTeam,
    };
  }

  public equals(other: DraftPick): boolean {
    return this.props.id === other.props.id;
  }
}