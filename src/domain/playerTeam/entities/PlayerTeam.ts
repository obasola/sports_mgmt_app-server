// src/domain/playerteam/entities/PlayerTeam.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface PlayerTeamProps {
  id?: number;
  playerId?: number;
  teamId?: number;
  jerseyNumber?: number;
  currentTeam?: boolean; // ✅ Matches actual schema
  isActive: boolean;
  startYear: number | undefined;
  endYear: number | undefined;
  contractValue?: number; // ✅ Matches actual schema
  contractLength?: number; // ✅ Matches actual schema
  // Relationship data (optional, loaded via includes)
  Player?: {
    id: number;
    firstName: string;
    lastName: string;
    position?: string;
  };
  Team?: {
    id: number;
    name: string;
    city?: string; // Optional since it can be null in database
    conference?: string;
    division?: string;
  };
}

export class PlayerTeam {
  private constructor(private props: PlayerTeamProps) {
    this.validate();
  }

  public static create(props: PlayerTeamProps): PlayerTeam {
    if (!props.playerId || !props.teamId) throw new Error('playerId and teamId are required');
    return new PlayerTeam(props);
  }

  // 🚨 CRITICAL: fromPersistence MUST match actual Prisma return types
  // Based on the error messages, the actual schema uses different field names
  public static fromPersistence(data: {
    id: number;
    playerId: number;
    teamId: number;
    jerseyNumber: number | null;
    currentTeam: boolean;
    isActive: boolean;
    startYear: number | undefined;
    endYear: number | undefined;
    contractValue: number | null;
    contractLength: number | null;
    // Optional relationship data from includes (capitalized names)
    Player?: {
      id: number;
      firstName: string;
      lastName: string;
      position?: string | null;
      // Add other Player fields as needed
    } | null;
    Team?: {
      id: number;
      name: string;
      city: string | null; // ✅ Actually nullable in your schema
      state?: string | null; // ✅ Additional field in your schema
      conference?: string | null; // ✅ Actually nullable in your schema
      division?: string | null; // ✅ Actually nullable in your schema
      stadium?: string | null; // ✅ Additional field in your schema
      scheduleId?: number | null; // ✅ Additional field in your schema
    } | null;
  }): PlayerTeam {
    return new PlayerTeam({
      id: data.id,
      playerId: data.playerId,
      teamId: data.teamId,
      jerseyNumber: data.jerseyNumber || undefined,
      currentTeam: data.currentTeam,
      isActive: data.isActive,
      startYear: data.startYear || undefined,
      endYear: data.endYear || undefined,
      contractValue: data.contractValue || undefined,
      contractLength: data.contractLength || undefined,
      // Convert relationship data (capitalized field names)
      Player: data.Player
        ? {
            id: data.Player.id,
            firstName: data.Player.firstName,
            lastName: data.Player.lastName,
            position: data.Player.position || undefined,
          }
        : undefined,
      Team: data.Team
        ? {
            id: data.Team.id,
            name: data.Team.name,
            city: data.Team.city || undefined, // Handle nullable city
            conference: data.Team.conference || undefined,
            division: data.Team.division || undefined,
          }
        : undefined,
    });
  }

  private validate(): void {
    if (this.props.playerId && this.props.playerId <= 0) {
      throw new ValidationError('Player ID must be positive');
    }

    if (this.props.teamId && this.props.teamId <= 0) {
      throw new ValidationError('Team ID must be positive');
    }

    if (this.props.jerseyNumber && (this.props.jerseyNumber < 0 || this.props.jerseyNumber > 99)) {
      throw new ValidationError('Jersey number must be between 0 and 99');
    }

    if (this.props.contractValue && this.props.contractValue < 0) {
      throw new ValidationError('Contract value cannot be negative');
    }

    if (this.props.contractLength && this.props.contractLength <= 0) {
      throw new ValidationError('Contract length must be positive');
    }

    if (this.props.startYear && this.props.endYear && this.props.startYear > this.props.endYear) {
      throw new ValidationError('Contract start date cannot be after end date');
    }
  }

  // Getters with actual schema field names
  public get id(): number | undefined {
    return this.props.id;
  }

  public get playerId(): number | undefined {
    return this.props.playerId;
  }

  public get teamId(): number | undefined {
    return this.props.teamId;
  }

  public get jerseyNumber(): number | undefined {
    return this.props.jerseyNumber;
  }

  public get currentTeam(): boolean | undefined {
    return this.props.currentTeam;
  }
  public get isActive(): boolean  {
    return this.props.isActive;
  }

  public get startYear(): number | undefined {
    return this.props.startYear;
  }

  public get endYear(): number | undefined {
    return this.props.endYear;
  }

  public get contractValue(): number | undefined {
    return this.props.contractValue;
  }

  public get contractLength(): number | undefined {
    return this.props.contractLength;
  }

  public get player():
    | { id: number; firstName: string; lastName: string; position?: string }
    | undefined {
    return this.props.Player;
  }

  public get team():
    | { id: number; name: string; city?: string; conference?: string; division?: string }
    | undefined {
    return this.props.Team;
  }

  // Business methods updated for actual schema
  public updateJerseyNumber(jerseyNumber: number): void {
    if (jerseyNumber < 0 || jerseyNumber > 99) {
      throw new ValidationError('Jersey number must be between 0 and 99');
    }
    this.props.jerseyNumber = jerseyNumber;
  }

  public setAsCurrentTeam(): void {
    this.props.currentTeam = true;
  }

  public removeAsCurrentTeam(): void {
    this.props.currentTeam = false;
  }

  public extendContract(newEndYear: number, newValue?: number): void {
    if (this.props.startYear && newEndYear <= this.props.startYear) {
      throw new ValidationError('Contract end date must be after start date');
    }
    this.props.endYear = newEndYear;
    if (newValue !== undefined) {
      this.props.contractValue = newValue;
    }
  }

  public isContractActive(): boolean {
    if (!this.props.startYear || !this.props.endYear) {
      return this.props.currentTeam || false;
    }

    const now = 0;
    return (
      now >= this.props.startYear && now <= this.props.endYear && (this.props.currentTeam || false)
    );
  }

  // 🔧 toPersistence: Convert entity back to Prisma format
  // Note: Relationship data is excluded as it's handled by Prisma relations
  public toPersistence(): {
    id?: number;
    playerId?: number;
    teamId?: number;
    jerseyNumber?: number;
    currentTeam?: boolean;
    isActive?: boolean;
    startYear: number | undefined;
    endYear: number | undefined;
    contractValue?: number;
    contractLength?: number;
  } {
    return {
      id: this.props.id,
      playerId: this.props.playerId,
      teamId: this.props.teamId,
      jerseyNumber: this.props.jerseyNumber,
      currentTeam: this.props.currentTeam,
      isActive: this.props.isActive,
      startYear: this.props.startYear,
      endYear: this.props.endYear,
      contractValue: this.props.contractValue,
      contractLength: this.props.contractLength,
      // Relationship data is excluded - handled by Prisma relations
    };
  }

  public equals(other: PlayerTeam): boolean {
    return this.props.id === other.props.id;
  }
}
