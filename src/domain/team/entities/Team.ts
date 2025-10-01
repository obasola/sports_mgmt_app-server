// src/domain/team/entities/Team.ts
import { TeamLocation } from '../value-objects/TeamLocation';
import { ValidationError } from '@/shared/errors/AppError';
// ❌ This cross-package type causes coupling and isn't used here; remove it
// import { TeamId } from '../../../../../sports_mgmt_app_client/src/types/team.types';

export interface TeamProps {
  id?: number;
  name: string;              // Required
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  stadium?: string;
  scheduleId?: number;
  // ✅ Optional because DB columns are nullable
  espnTeamId?: number;
  abbreviation?: string;
}

export class Team {
  private constructor(private props: TeamProps) {
    this.validate();
  }

  public static create(props: TeamProps): Team {
    return new Team(props);
  }

  // ✅ Match Prisma model: many fields can be null
  public static fromPersistence(data: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
    conference: string | null;
    division: string | null;
    stadium: string | null;
    scheduleId: number | null;
    espnTeamId: number | null;
    abbreviation: string | null;
  }): Team {
    return new Team({
      id: data.id,
      name: data.name,
      city: data.city ?? undefined,
      state: data.state ?? undefined,
      conference: data.conference ?? undefined,
      division: data.division ?? undefined,
      stadium: data.stadium ?? undefined,
      scheduleId: data.scheduleId ?? undefined,
      espnTeamId: data.espnTeamId ?? undefined,       // ✅ null → undefined
      abbreviation: data.abbreviation ?? undefined,    // ✅ null → undefined
    });
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError('Team name is required');
    }
    if (this.props.name.length > 45) {
      throw new ValidationError('Team name cannot exceed 45 characters');
    }
    if (this.props.city && this.props.city.length > 45) {
      throw new ValidationError('City cannot exceed 45 characters');
    }
    if (this.props.state && this.props.state.length > 45) {
      throw new ValidationError('State cannot exceed 45 characters');
    }
    if (this.props.conference && this.props.conference.length > 45) {
      throw new ValidationError('Conference cannot exceed 45 characters');
    }
    if (this.props.division && this.props.division.length > 45) {
      throw new ValidationError('Division cannot exceed 45 characters');
    }
    if (this.props.stadium && this.props.stadium.length > 75) {
      throw new ValidationError('Stadium name cannot exceed 75 characters');
    }
    // Optional fields: espnTeamId & abbreviation do not need validation unless present
    if (this.props.abbreviation && this.props.abbreviation.length > 10) {
      throw new ValidationError('Abbreviation cannot exceed 10 characters');
    }
  }

  // Getters
  public get id(): number | undefined { return this.props.id; }
  public get name(): string { return this.props.name; }
  public get city(): string | undefined { return this.props.city; }
  public get state(): string | undefined { return this.props.state; }
  public get conference(): string | undefined { return this.props.conference; }
  public get division(): string | undefined { return this.props.division; }
  public get stadium(): string | undefined { return this.props.stadium; }
  public get scheduleId(): number | undefined { return this.props.scheduleId; }
  public get espnTeamId(): number | undefined { return this.props.espnTeamId; }
  public get abbreviation(): string | undefined { return this.props.abbreviation; }

  // Business methods
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Team name cannot be empty');
    }
    if (name.length > 45) {
      throw new ValidationError('Team name cannot exceed 45 characters');
    }
    this.props.name = name.trim();
  }

  public updateLocation(city?: string, state?: string): void {
    if (city || state) {
      const location = new TeamLocation(city, state);
      this.props.city = location.city;
      this.props.state = location.state;
    }
  }

  public updateStadium(stadium?: string): void {
    if (stadium && stadium.length > 75) {
      throw new ValidationError('Stadium name cannot exceed 75 characters');
    }
    this.props.stadium = stadium;
  }

  public assignSchedule(scheduleId: number): void {
    if (scheduleId <= 0) {
      throw new ValidationError('Schedule ID must be positive');
    }
    this.props.scheduleId = scheduleId;
  }

  public removeSchedule(): void {
    this.props.scheduleId = undefined;
  }

  public getLocation(): TeamLocation | null | undefined {
    if (this.props.city || this.props.state) {
      return new TeamLocation(this.props.city, this.props.state);
    }
    return null;
  }

  public getFullName(): string {
    return this.props.city ? `${this.props.city} ${this.props.name}` : this.props.name;
  }

  public isInConference(conference: string): boolean {
    return this.props.conference?.toLowerCase() === conference.toLowerCase();
  }

  public isInDivision(division: string): boolean {
    return this.props.division?.toLowerCase() === division.toLowerCase();
  }

  // Prisma persistence shape
  public toPersistence(): {
    id?: number;
    name: string;
    city?: string;
    state?: string;
    conference?: string;
    division?: string;
    stadium?: string;
    scheduleId?: number;
    espnTeamId?: number;
    abbreviation?: string;
  } {
    return {
      id: this.props.id,
      name: this.props.name,
      city: this.props.city,
      state: this.props.state,
      conference: this.props.conference,
      division: this.props.division,
      stadium: this.props.stadium,
      scheduleId: this.props.scheduleId,
      espnTeamId: this.props.espnTeamId,
      abbreviation: this.props.abbreviation,
    };
  }

  public equals(other: Team): boolean {
    return this.props.id === other.props.id;
  }
}
