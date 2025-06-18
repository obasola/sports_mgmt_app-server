// src/domain/playerteam/entities/PlayerTeam.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface PlayerTeamProps {
  id?: number;
  playerId?: number;
  teamId?: number;
  jerseyNumber?: number;
  currentTeam?: boolean; // ✅ Matches actual schema
  startDate?: Date; // ✅ Matches actual schema
  endDate?: Date; // ✅ Matches actual schema
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
    city?: string;        // Optional since it can be null in database
    conference?: string;
    division?: string;
  };
}

export class PlayerTeam {
  private constructor(private props: PlayerTeamProps) {
    this.validate();
  }

  public static create(props: PlayerTeamProps): PlayerTeam {
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
    startDate: Date | null;
    endDate: Date | null;
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
      city: string | null;        // ✅ Actually nullable in your schema
      state?: string | null;      // ✅ Additional field in your schema
      conference?: string | null; // ✅ Actually nullable in your schema
      division?: string | null;   // ✅ Actually nullable in your schema
      stadium?: string | null;    // ✅ Additional field in your schema
      scheduleId?: number | null; // ✅ Additional field in your schema
    } | null;
  }): PlayerTeam {
    return new PlayerTeam({
      id: data.id,
      playerId: data.playerId,
      teamId: data.teamId,
      jerseyNumber: data.jerseyNumber || undefined,
      currentTeam: data.currentTeam,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      contractValue: data.contractValue || undefined,
      contractLength: data.contractLength || undefined,
      // Convert relationship data (capitalized field names)
      Player: data.Player ? {
        id: data.Player.id,
        firstName: data.Player.firstName,
        lastName: data.Player.lastName,
        position: data.Player.position || undefined,
      } : undefined,
      Team: data.Team ? {
        id: data.Team.id,
        name: data.Team.name,
        city: data.Team.city || undefined,           // Handle nullable city
        conference: data.Team.conference || undefined,
        division: data.Team.division || undefined,
      } : undefined,
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

    if (this.props.startDate && this.props.endDate && 
        this.props.startDate > this.props.endDate) {
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

  public get startDate(): Date | undefined {
    return this.props.startDate;
  }

  public get endDate(): Date | undefined {
    return this.props.endDate;
  }

  public get contractValue(): number | undefined {
    return this.props.contractValue;
  }

  public get contractLength(): number | undefined {
    return this.props.contractLength;
  }

  public get player(): { id: number; firstName: string; lastName: string; position?: string } | undefined {
    return this.props.Player;
  }

  public get team(): { id: number; name: string; city?: string; conference?: string; division?: string } | undefined {
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

  public extendContract(newEndDate: Date, newValue?: number): void {
    if (this.props.startDate && newEndDate <= this.props.startDate) {
      throw new ValidationError('Contract end date must be after start date');
    }
    this.props.endDate = newEndDate;
    if (newValue !== undefined) {
      this.props.contractValue = newValue;
    }
  }

  public isContractActive(): boolean {
    if (!this.props.startDate || !this.props.endDate) {
      return this.props.currentTeam || false;
    }
    
    const now = new Date();
    return now >= this.props.startDate && 
           now <= this.props.endDate && 
           (this.props.currentTeam || false);
  }

  // 🔧 toPersistence: Convert entity back to Prisma format
  // Note: Relationship data is excluded as it's handled by Prisma relations
  public toPersistence(): {
    id?: number;
    playerId?: number;
    teamId?: number;
    jerseyNumber?: number;
    currentTeam?: boolean;
    startDate?: Date;
    endDate?: Date;
    contractValue?: number;
    contractLength?: number;
  } {
    return {
      id: this.props.id,
      playerId: this.props.playerId,
      teamId: this.props.teamId,
      jerseyNumber: this.props.jerseyNumber,
      currentTeam: this.props.currentTeam,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      contractValue: this.props.contractValue,
      contractLength: this.props.contractLength,
      // Relationship data is excluded - handled by Prisma relations
    };
  }

  public equals(other: PlayerTeam): boolean {
    return this.props.id === other.props.id;
  }
}