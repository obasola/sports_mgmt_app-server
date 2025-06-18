// src/domain/schedule/entities/Schedule.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface ScheduleProps {
  id?: number;
  teamId?: number;
  seasonYear?: number;
  oppTeamId: number;
  oppTeamConference?: string;
  oppTeamDivision?: string;
  scheduleWeek?: number;
  gameDate?: Date;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  gameLocation?: string;
  wonLostFlag?: string;
  homeOrAway?: string;
  oppTeamScore?: number;
  teamScore?: number;
}

export class Schedule {
  private constructor(private props: ScheduleProps) {
    this.validate();
  }

  public static create(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  public static fromPersistence(data: {
    id: number;
    teamId: number | null;
    seasonYear: number | null;
    oppTeamId: number;
    oppTeamConference: string | null;
    oppTeamDivision: string | null;
    scheduleWeek: number | null;
    gameDate: Date | null;
    gameCity: string | null;
    gameStateProvince: string | null;
    gameCountry: string | null;
    gameLocation: string | null;
    wonLostFlag: string | null;
    homeOrAway: string | null;
    oppTeamScore: number | null;
    teamScore: number | null;
  }): Schedule {
    return new Schedule({
      id: data.id,
      teamId: data.teamId || undefined,
      seasonYear: data.seasonYear || undefined,
      oppTeamId: data.oppTeamId,
      oppTeamConference: data.oppTeamConference || undefined,
      oppTeamDivision: data.oppTeamDivision || undefined,
      scheduleWeek: data.scheduleWeek || undefined,
      gameDate: data.gameDate || undefined,
      gameCity: data.gameCity || undefined,
      gameStateProvince: data.gameStateProvince || undefined,
      gameCountry: data.gameCountry || undefined,
      gameLocation: data.gameLocation || undefined,
      wonLostFlag: data.wonLostFlag || undefined,
      homeOrAway: data.homeOrAway || undefined,
      oppTeamScore: data.oppTeamScore || undefined,
      teamScore: data.teamScore || undefined,
    });
  }

  private validate(): void {
    if (!this.props.oppTeamId) {
      throw new ValidationError('Opponent team ID is required');
    }

    if (this.props.oppTeamConference && this.props.oppTeamConference.length > 45) {
      throw new ValidationError('Opponent team conference cannot exceed 45 characters');
    }

    if (this.props.oppTeamDivision && this.props.oppTeamDivision.length > 45) {
      throw new ValidationError('Opponent team division cannot exceed 45 characters');
    }

    if (this.props.scheduleWeek && (this.props.scheduleWeek < 1 || this.props.scheduleWeek > 20)) {
      throw new ValidationError('Schedule week must be between 1 and 20');
    }

    if (this.props.gameCity && this.props.gameCity.length > 45) {
      throw new ValidationError('Game city cannot exceed 45 characters');
    }

    if (this.props.gameStateProvince && this.props.gameStateProvince.length > 45) {
      throw new ValidationError('Game state/province cannot exceed 45 characters');
    }

    if (this.props.gameCountry && this.props.gameCountry.length > 45) {
      throw new ValidationError('Game country cannot exceed 45 characters');
    }

    if (this.props.gameLocation && this.props.gameLocation.length > 75) {
      throw new ValidationError('Game location cannot exceed 75 characters');
    }

    if (this.props.wonLostFlag && this.props.wonLostFlag.length !== 1) {
      throw new ValidationError('Won/Lost flag must be a single character');
    }

    if (this.props.homeOrAway && this.props.homeOrAway.length !== 1) {
      throw new ValidationError('Home/Away flag must be a single character');
    }

    if (this.props.oppTeamScore && this.props.oppTeamScore < 0) {
      throw new ValidationError('Opponent team score cannot be negative');
    }

    if (this.props.teamScore && this.props.teamScore < 0) {
      throw new ValidationError('Team score cannot be negative');
    }

    if (this.props.seasonYear && (this.props.seasonYear < 1990 || this.props.seasonYear > 2030)) {
      throw new ValidationError('Season year must be between 1990 and 2030');
    }
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get teamId(): number | undefined {
    return this.props.teamId;
  }

  public get seasonYear(): number | undefined {
    return this.props.seasonYear;
  }

  public get oppTeamId(): number {
    return this.props.oppTeamId;
  }

  public get oppTeamConference(): string | undefined {
    return this.props.oppTeamConference;
  }

  public get oppTeamDivision(): string | undefined {
    return this.props.oppTeamDivision;
  }

  public get scheduleWeek(): number | undefined {
    return this.props.scheduleWeek;
  }

  public get gameDate(): Date | undefined {
    return this.props.gameDate;
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

  public get gameLocation(): string | undefined {
    return this.props.gameLocation;
  }

  public get wonLostFlag(): string | undefined {
    return this.props.wonLostFlag;
  }

  public get homeOrAway(): string | undefined {
    return this.props.homeOrAway;
  }

  public get oppTeamScore(): number | undefined {
    return this.props.oppTeamScore;
  }

  public get teamScore(): number | undefined {
    return this.props.teamScore;
  }

  // Business methods
  public updateGameResult(teamScore: number, oppTeamScore: number, wonLostFlag: string): void {
    if (teamScore < 0 || oppTeamScore < 0) {
      throw new ValidationError('Scores cannot be negative');
    }

    if (wonLostFlag.length !== 1) {
      throw new ValidationError('Won/Lost flag must be a single character');
    }

    this.props.teamScore = teamScore;
    this.props.oppTeamScore = oppTeamScore;
    this.props.wonLostFlag = wonLostFlag;
  }

  public updateGameLocation(city?: string, stateProvince?: string, country?: string, location?: string): void {
    if (city && city.length > 45) {
      throw new ValidationError('Game city cannot exceed 45 characters');
    }
    if (stateProvince && stateProvince.length > 45) {
      throw new ValidationError('Game state/province cannot exceed 45 characters');
    }
    if (country && country.length > 45) {
      throw new ValidationError('Game country cannot exceed 45 characters');
    }
    if (location && location.length > 75) {
      throw new ValidationError('Game location cannot exceed 75 characters');
    }

    this.props.gameCity = city;
    this.props.gameStateProvince = stateProvince;
    this.props.gameCountry = country;
    this.props.gameLocation = location;
  }

  public isGameCompleted(): boolean {
    return this.props.teamScore !== undefined && 
           this.props.oppTeamScore !== undefined && 
           this.props.wonLostFlag !== undefined;
  }

  public isHomeGame(): boolean {
    return this.props.homeOrAway === 'H';
  }

  public isAwayGame(): boolean {
    return this.props.homeOrAway === 'A';
  }

  public getGameResultSummary(): string {
    if (!this.isGameCompleted()) {
      return 'Game not completed';
    }

    const location = this.isHomeGame() ? 'vs' : '@';
    return `${location} Opponent: ${this.props.teamScore}-${this.props.oppTeamScore} (${this.props.wonLostFlag})`;
  }

  public toPersistence(): {
    id?: number;
    teamId?: number;
    seasonYear?: number;
    oppTeamId: number;
    oppTeamConference?: string;
    oppTeamDivision?: string;
    scheduleWeek?: number;
    gameDate?: Date;
    gameCity?: string;
    gameStateProvince?: string;
    gameCountry?: string;
    gameLocation?: string;
    wonLostFlag?: string;
    homeOrAway?: string;
    oppTeamScore?: number;
    teamScore?: number;
  } {
    return {
      id: this.props.id,
      teamId: this.props.teamId,
      seasonYear: this.props.seasonYear,
      oppTeamId: this.props.oppTeamId,
      oppTeamConference: this.props.oppTeamConference,
      oppTeamDivision: this.props.oppTeamDivision,
      scheduleWeek: this.props.scheduleWeek,
      gameDate: this.props.gameDate,
      gameCity: this.props.gameCity,
      gameStateProvince: this.props.gameStateProvince,
      gameCountry: this.props.gameCountry,
      gameLocation: this.props.gameLocation,
      wonLostFlag: this.props.wonLostFlag,
      homeOrAway: this.props.homeOrAway,
      oppTeamScore: this.props.oppTeamScore,
      teamScore: this.props.teamScore,
    };
  }

  public equals(other: Schedule): boolean {
    return this.props.id === other.props.id;
  }
}


