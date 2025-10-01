// Domain Entity
// src/domain/game/entities/Game.ts
import { GameStatus } from '../value-objects/GameStatus';
import { GameLocation } from '../value-objects/GameLocation';
import { ValidationError } from '@/shared/errors/AppError';
import { Team } from '@/domain/team/entities/Team';

export type SeasonType = 1 | 2 | 3; // 1=pre, 2=regular, 3=post

export interface GameProps {
  id?: number;
  seasonYear?: string;
  gameWeek?: number;           // allow 0 for preseason
  /** New: canonical season type (preferred going forward). 1=pre, 2=reg, 3=post */
  seasonType?: SeasonType;
  /** Legacy: kept for backward compatibility; if provided, mapped to seasonType=1 when ==1 */
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
  /** New: ESPN identifiers for idempotent upserts */
  espnEventId?: string | null;
  espnCompetitionId?: string | null;

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
  seasonType?: SeasonType;
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
  espnEventId?: string | null;
  espnCompetitionId?: string | null;
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
    this.applyBusinessRules();
    this.validate();
  }

  private static normalizeSeasonType(props: GameProps): SeasonType | undefined {
    // Prefer explicit seasonType; map legacy preseason==1 to seasonType=1
    if (props.seasonType === 1 || props.seasonType === 2 || props.seasonType === 3) return props.seasonType;
    if (props.preseason === 1) return 1;
    return undefined;
  }

  private static normalizeStatus(input?: string | null): string | undefined {
    if (!input) return undefined;
    const s = input.toLowerCase();
    // Common ESPN names: STATUS_SCHEDULED, STATUS_IN_PROGRESS, STATUS_FINAL, STATUS_POSTPONED, STATUS_CANCELED
    if (s.includes('final') || s === 'completed' || s === 'complete') return 'completed';
    if (s.includes('in') && s.includes('progress')) return 'in_progress';
    if (s.includes('postpon')) return 'postponed';
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('sched')) return 'scheduled';
    // fallback: return as-is (lowercased)
    return s;
  }

  private static toNonNegativeIntOrUndefined(v: unknown): number | undefined {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) return undefined;
    return Math.trunc(n);
  }

  private applyBusinessRules(): void {
    // Canonicalize seasonType
    const seasonType = Game.normalizeSeasonType(this.props);
    if (seasonType) this.props.seasonType = seasonType;

    // Auto-set gameWeek=0 for preseason games when not supplied
    if (this.props.seasonType === 1 && this.props.gameWeek === undefined) {
      this.props.gameWeek = 0;
    }

    // Normalize scores to integers when provided
    this.props.homeScore = Game.toNonNegativeIntOrUndefined(this.props.homeScore);
    this.props.awayScore = Game.toNonNegativeIntOrUndefined(this.props.awayScore);

    // Normalize status naming
    if (this.props.gameStatus) {
      this.props.gameStatus = Game.normalizeStatus(this.props.gameStatus);
    }
  }

  public static create(props: GameProps): Game {
    return new Game(props);
  }

  public static fromPersistence(data: {
    id: number;
    seasonYear: string;
    gameWeek: number | null;
    preseason: number | null;
    /** New optional column(s) if present in persistence */
    seasonType?: number | null;
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
    /** New ESPN identifiers if present */
    espnEventId?: string | null;
    espnCompetitionId?: string | null;

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
      gameWeek: data.gameWeek ?? undefined,
      // Prefer seasonType if available; else legacy preseason mapping
      seasonType: (data.seasonType === 1 || data.seasonType === 2 || data.seasonType === 3)
        ? (data.seasonType as SeasonType)
        : (data.preseason === 1 ? 1 : undefined),
      preseason: data.preseason ?? undefined,
      gameDate: data.gameDate ?? undefined,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      gameLocation: data.gameLocation ?? undefined,
      gameCity: data.gameCity ?? undefined,
      gameStateProvince: data.gameStateProvince ?? undefined,
      gameCountry: data.gameCountry ?? undefined,
      homeScore: data.homeScore ?? undefined,
      awayScore: data.awayScore ?? undefined,
      gameStatus: data.gameStatus ?? undefined,
      espnEventId: data.espnEventId ?? null,
      espnCompetitionId: data.espnCompetitionId ?? null,
      createdAt: data.createdAt ?? undefined,
      updatedAt: data.updatedAt ?? undefined,

      // ✅ Keep nulls as null; do not coerce to undefined
      homeTeam: data.homeTeam
        ? {
            id: data.homeTeam.id,
            name: data.homeTeam.name,
            city: data.homeTeam.city,
            state: data.homeTeam.state,
            conference: data.homeTeam.conference,
            division: data.homeTeam.division,
            stadium: data.homeTeam.stadium,
            scheduleId: data.homeTeam.scheduleId,
          }
        : undefined,

      awayTeam: data.awayTeam
        ? {
            id: data.awayTeam.id,
            name: data.awayTeam.name,
            city: data.awayTeam.city,
            state: data.awayTeam.state,
            conference: data.awayTeam.conference,
            division: data.awayTeam.division,
            stadium: data.awayTeam.stadium,
            scheduleId: data.awayTeam.scheduleId,
          }
        : undefined,
    });
  }

  // Team relation getters
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
  public toPlainObject(): GameProps & {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return { ...this.props };
  }

  private validate(): void {
    // seasonYear
    if (this.props.seasonYear && !/^\d{4}$/.test(this.props.seasonYear)) {
      throw new ValidationError('Season year must be a 4-digit year');
    }

    // gameWeek (allow 0–20)
    if (this.props.gameWeek !== undefined) {
      if (this.props.gameWeek < 0 || this.props.gameWeek > 20) {
        throw new ValidationError('Game week must be between 0 and 20');
      }
    }

    // Season typing (canonical)
    if (this.props.seasonType !== undefined) {
      const st = this.props.seasonType;
      if (st !== 1 && st !== 2 && st !== 3) {
        throw new ValidationError('seasonType must be 1 (pre), 2 (reg), or 3 (post)');
      }
      // Business rule: preseason (1) must have week 0
      if (st === 1 && this.props.gameWeek !== 0) {
        throw new ValidationError('Preseason (seasonType=1) games must have gameWeek = 0');
      }
    } else {
      // Legacy validation if only "preseason" provided
      if (
        this.props.preseason !== undefined &&
        this.props.preseason !== 0 &&
        this.props.preseason !== 1
      ) {
        throw new ValidationError('Preseason must be 0 or 1 when used');
      }
      if (this.props.preseason === 1 && this.props.gameWeek !== 0) {
        throw new ValidationError('Preseason games must have gameWeek = 0');
      }
    }

    // Team sanity
    if (
      this.props.homeTeamId !== undefined &&
      this.props.awayTeamId !== undefined &&
      this.props.homeTeamId === this.props.awayTeamId
    ) {
      throw new ValidationError('Home team and away team cannot be the same');
    }
  }

  // Getters
  public get id(): number | undefined { return this.props.id; }
  public get seasonYear(): string | undefined { return this.props.seasonYear; }
  public get gameWeek(): number | undefined { return this.props.gameWeek; }
  /** Canonical accessor */
  public get seasonType(): SeasonType | undefined { return this.props.seasonType; }
  /** Legacy (discouraged) */
  public get preseason(): number | undefined { return this.props.preseason; }
  public get gameDate(): Date | undefined { return this.props.gameDate; }
  public get homeTeamId(): number | undefined { return this.props.homeTeamId; }
  public get awayTeamId(): number | undefined { return this.props.awayTeamId; }
  public get gameLocation(): string | undefined { return this.props.gameLocation; }
  public get gameCity(): string | undefined { return this.props.gameCity; }
  public get gameStateProvince(): string | undefined { return this.props.gameStateProvince; }
  public get gameCountry(): string | undefined { return this.props.gameCountry; }
  public get homeScore(): number | undefined { return this.props.homeScore; }
  public get awayScore(): number | undefined { return this.props.awayScore; }
  public get gameStatus(): string | undefined { return this.props.gameStatus; }
  public get espnEventId(): string | null | undefined { return this.props.espnEventId; }
  public get espnCompetitionId(): string | null | undefined { return this.props.espnCompetitionId; }
  public get createdAt(): Date | undefined { return this.props.createdAt; }
  public get updatedAt(): Date | undefined { return this.props.updatedAt; }

  // Business methods
  public updateScore(homeScore: number, awayScore: number): void {
    if (homeScore < 0 || awayScore < 0) {
      throw new ValidationError('Scores cannot be negative');
    }
    this.props.homeScore = Math.trunc(homeScore);
    this.props.awayScore = Math.trunc(awayScore);
  }

  public updateStatus(status: string): void {
    const normalized = Game.normalizeStatus(status);
    const valid = ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'];
    if (!normalized || !valid.includes(normalized)) {
      throw new ValidationError(`Invalid game status: ${status}`);
    }
    this.props.gameStatus = normalized;
  }

  public markCompleted(homeScore: number, awayScore: number): void {
    this.updateScore(homeScore, awayScore);
    this.updateStatus('completed');
  }

  public getWinningTeamId(): number | null {
    if (
      this.props.gameStatus !== 'completed' ||
      this.props.homeScore === undefined ||
      this.props.awayScore === undefined
    ) {
      return null;
    }
    if (this.props.homeScore > this.props.awayScore) return this.props.homeTeamId ?? null;
    if (this.props.awayScore > this.props.homeScore) return this.props.awayTeamId ?? null;
    return null; // tie
  }

  public isTie(): boolean {
    return (
      this.props.gameStatus === 'completed' &&
      this.props.homeScore !== undefined &&
      this.props.awayScore !== undefined &&
      this.props.homeScore === this.props.awayScore
    );
  }

  // Persistence mapper (round-trip friendly)
  public toPersistence(): {
    id?: number;
    seasonYear?: string;
    gameWeek?: number;
    seasonType?: SeasonType;
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
    espnEventId?: string | null;
    espnCompetitionId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: this.props.id,
      seasonYear: this.props.seasonYear,
      gameWeek: this.props.gameWeek,
      seasonType: this.props.seasonType,
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
      espnEventId: this.props.espnEventId ?? null,
      espnCompetitionId: this.props.espnCompetitionId ?? null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  public equals(other: Game): boolean {
    // Prefer ESPN competition id for identity if both have it
    if (this.props.espnCompetitionId && other.props.espnCompetitionId) {
      return this.props.espnCompetitionId === other.props.espnCompetitionId;
    }
    if (this.props.id !== undefined && other.props.id !== undefined) {
      return this.props.id === other.props.id;
    }
    // Fallback heuristic on natural identifiers
    return (
      this.props.seasonYear === other.props.seasonYear &&
      this.props.seasonType === other.props.seasonType &&
      this.props.gameWeek === other.props.gameWeek &&
      this.props.homeTeamId === other.props.homeTeamId &&
      this.props.awayTeamId === other.props.awayTeamId
    );
  }
}
