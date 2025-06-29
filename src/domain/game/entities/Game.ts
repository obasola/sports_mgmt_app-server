// Domain Entity
// src/domain/game/entities/Game.ts
import { GameStatus } from '../value-objects/GameStatus';
import { GameLocation } from '../value-objects/GameLocation';
import { ValidationError } from '@/shared/errors/AppError';
import { Team } from '@/domain/team/entities/Team';

export interface GameProps {
  id?: number;
  seasonYear?: string;
  gameWeek?: number;
  preseason?: number;
  gameDate?: Date;
  homeTeamId?: number;
  awayTeamId?: number;
  gameLocation?: string;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  homeScore?: number;
  awayScore?: number;
  gameStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
  homeTeam?: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
    conference: string | null;
    division: string | null;
    stadium: string | null;
    scheduleId: number | null;
  };
  awayTeam?: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
    conference: string | null;
    division: string | null;
    stadium: string | null;
    scheduleId: number | null;
  };
}

export interface GamePropsWithTeams {
  // Game fields
  id: number;
  seasonYear: string;
  gameWeek?: number;
  preseason?: number;
  gameDate?: Date;
  homeTeamId: number;
  awayTeamId: number;
  gameLocation?: string;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  homeScore?: number;
  awayScore?: number;
  gameStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  homeTeam: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    conference?: string;
    division?: string;
    stadium?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    conference?: string;
    division?: string;
    stadium?: string;
  };
}

export class Game {
  private constructor(private props: GameProps) {
    this.applyBusinessRules(); // ← ADD THIS LINE
    this.validate();
  }
  private applyBusinessRules(): void {
    // Auto-set gameWeek=0 for preseason games
    if (this.props.preseason === 1 && this.props.gameWeek === undefined) {
      this.props.gameWeek = 0;
    }
  }

  public static create(props: GameProps): Game {
    return new Game(props);
  }

  // 🔧 FIX 1: Update fromPersistence to actually map team relations
  public static fromPersistence(data: {
    id: number;
    seasonYear: string;
    gameWeek: number | null;
    preseason: number | null;
    gameDate: Date | null;
    homeTeamId: number;
    awayTeamId: number;
    gameLocation: string | null;
    gameCity: string | null;
    gameStateProvince: string | null;
    gameCountry: string | null;
    homeScore: number | null;
    awayScore: number | null;
    gameStatus: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    homeTeam?: {
      id: number;
      name: string;
      city: string | null;
      state: string | null;
      conference: string | null;
      division: string | null;
      stadium: string | null;
      scheduleId: number | null;
    };
    awayTeam?: {
      id: number;
      name: string;
      city: string | null;
      state: string | null;
      conference: string | null;
      division: string | null;
      stadium: string | null;
      scheduleId: number | null;
    };
  }): Game {
    return new Game({
      id: data.id,
      seasonYear: data.seasonYear,
      gameWeek: data.gameWeek || undefined,
      preseason: data.preseason || undefined,
      gameDate: data.gameDate || undefined,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      gameLocation: data.gameLocation || undefined,
      gameCity: data.gameCity || undefined,
      gameStateProvince: data.gameStateProvince || undefined,
      gameCountry: data.gameCountry || undefined,
      homeScore: data.homeScore || undefined,
      awayScore: data.awayScore || undefined,
      gameStatus: data.gameStatus || undefined,
      createdAt: data.createdAt || undefined,
      updatedAt: data.updatedAt || undefined,

      // ✅ FIX: Keep null as null, don't convert to undefined
      homeTeam: data.homeTeam
        ? {
            id: data.homeTeam.id,
            name: data.homeTeam.name,
            city: data.homeTeam.city, // Keep as null
            state: data.homeTeam.state, // Keep as null
            conference: data.homeTeam.conference, // Keep as null
            division: data.homeTeam.division, // Keep as null
            stadium: data.homeTeam.stadium, // Keep as null
            scheduleId: data.homeTeam.scheduleId, // Keep as null
          }
        : undefined,

      awayTeam: data.awayTeam
        ? {
            id: data.awayTeam.id,
            name: data.awayTeam.name,
            city: data.awayTeam.city, // Keep as null
            state: data.awayTeam.state, // Keep as null
            conference: data.awayTeam.conference, // Keep as null
            division: data.awayTeam.division, // Keep as null
            stadium: data.awayTeam.stadium, // Keep as null
            scheduleId: data.awayTeam.scheduleId, // Keep as null
          }
        : undefined,
    });
  }

  // 🔧 FIX 2: Add missing getters for team relations
  // Add these getters after your existing getters (around line 300):

  public get homeTeam():
    | {
        id: number;
        name: string;
        city: string | null;
        state: string | null;
        conference: string | null;
        division: string | null;
        stadium: string | null;
        scheduleId: number | null;
      }
    | undefined {
    return this.props.homeTeam;
  }

  public get awayTeam():
    | {
        id: number;
        name: string;
        city: string | null;
        state: string | null;
        conference: string | null;
        division: string | null;
        stadium: string | null;
        scheduleId: number | null;
      }
    | undefined {
    return this.props.awayTeam;
  }
  /*
   *********************************************************************
   */
  public toPlainObject(): GameProps & { id?: number; createdAt?: Date; updatedAt?: Date } {
    return { ...this.props };
  }

  private validate(): void {
   // console.log('🔍 Validating Game with props:', JSON.stringify(this.props, null, 2));
    // Update gameWeek validation to allow 0
    if (this.props.gameWeek !== undefined) {
      if (this.props.gameWeek < 0 || this.props.gameWeek > 20) {
        throw new ValidationError('Game week must be between 0 and 20');
      }
    }

    // Business rule: preseason games must have gameWeek = 0
    if (this.props.preseason === 1 && this.props.gameWeek !== 0) {
      throw new ValidationError('Preseason games must have gameWeek = 0');
    }
    // Basic validations only
    if (this.props.seasonYear && !/^\d{4}$/.test(this.props.seasonYear)) {
      throw new ValidationError('Season year must be a 4-digit year');
    }

    if (this.props.gameWeek && (this.props.gameWeek < 1 || this.props.gameWeek > 20)) {
      throw new ValidationError('Game week must be between 1 and 20');
    }

    // Simple preseason validation
    if (
      this.props.preseason !== undefined &&
      this.props.preseason !== 0 &&
      this.props.preseason !== 1
    ) {
      throw new ValidationError('Preseason must be 0 or 1');
    }

    // Simple team validation
    if (
      this.props.homeTeamId &&
      this.props.awayTeamId &&
      this.props.homeTeamId === this.props.awayTeamId
    ) {
      throw new ValidationError('Home team and away team cannot be the same');
    }

    console.log('✅ Game validation passed');
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get seasonYear(): string | undefined {
    return this.props.seasonYear;
  }

  public get gameWeek(): number | undefined {
    return this.props.gameWeek;
  }

  public get preseason(): number | undefined {
    return this.props.preseason;
  }

  public get gameDate(): Date | undefined {
    return this.props.gameDate;
  }

  public get homeTeamId(): number | undefined {
    return this.props.homeTeamId;
  }

  public get awayTeamId(): number | undefined {
    return this.props.awayTeamId;
  }

  public get gameLocation(): string | undefined {
    return this.props.gameLocation;
  }

  public get gameCity(): string | undefined {
    return this.props.gameCity;
  }

  public get gameStateProvince(): string | undefined {
    return this.props.gameStateProvince;
  }

  public get gameCountry(): string | undefined {
    return this.props.gameCountry;
  }

  public get homeScore(): number | undefined {
    return this.props.homeScore;
  }

  public get awayScore(): number | undefined {
    return this.props.awayScore;
  }

  public get gameStatus(): string | undefined {
    return this.props.gameStatus;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business methods
  public updateScore(homeScore: number, awayScore: number): void {
    if (homeScore < 0 || awayScore < 0) {
      throw new ValidationError('Scores cannot be negative');
    }
    this.props.homeScore = homeScore;
    this.props.awayScore = awayScore;
  }

  public updateStatus(status: string): void {
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid game status: ${status}`);
    }
    this.props.gameStatus = status;
  }

  public markCompleted(homeScore: number, awayScore: number): void {
    this.updateScore(homeScore, awayScore);
    this.updateStatus('completed');
  }

  public getWinningTeamId(): number | null {
    if (!this.props.homeScore || !this.props.awayScore || this.props.gameStatus !== 'completed') {
      return null;
    }

    if (this.props.homeScore > this.props.awayScore) {
      return this.props.homeTeamId!;
    } else if (this.props.awayScore > this.props.homeScore) {
      return this.props.awayTeamId!;
    }

    return null; // Tie game
  }

  public isTie(): boolean {
    return this.props.gameStatus === 'completed' && this.props.homeScore === this.props.awayScore;
  }

  // 🔧 toPersistence: Convert entity back to Prisma format
  public toPersistence(): {
    id?: number;
    seasonYear?: string;
    gameWeek?: number;
    preseason?: number;
    gameDate?: Date;
    homeTeamId?: number;
    awayTeamId?: number;
    gameLocation?: string;
    gameCity?: string;
    gameStateProvince?: string;
    gameCountry?: string;
    homeScore?: number;
    awayScore?: number;
    gameStatus?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: this.props.id,
      seasonYear: this.props.seasonYear,
      gameWeek: this.props.gameWeek,
      preseason: this.props.preseason,
      gameDate: this.props.gameDate,
      homeTeamId: this.props.homeTeamId,
      awayTeamId: this.props.awayTeamId,
      gameLocation: this.props.gameLocation,
      gameCity: this.props.gameCity,
      gameStateProvince: this.props.gameStateProvince,
      gameCountry: this.props.gameCountry,
      homeScore: this.props.homeScore,
      awayScore: this.props.awayScore,
      gameStatus: this.props.gameStatus,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  public equals(other: Game): boolean {
    return this.props.id === other.props.id;
  }
}
