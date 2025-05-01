import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

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

export class DraftPick extends BaseEntity<DraftPickProps> {
  private constructor(props: DraftPickProps) {
    super(props);
  }

  /**
   * Factory method to create a new DraftPick entity
   */
  public static create(props: DraftPickProps): Result<DraftPick> {
    // Validation logic
    if (!props.round || props.round <= 0) {
      return Result.fail<DraftPick>('Round must be a positive number');
    }

    props.used ?? false; // Explicitly set a default for 'used'

    if (!props.pickNumber || props.pickNumber <= 0) {
      return Result.fail<DraftPick>('Pick number must be a positive number');
    }

    if (!props.draftYear || props.draftYear <= 0) {
      return Result.fail<DraftPick>('Draft year must be a positive number');
    }

    if (!props.currentTeamId || props.currentTeamId <= 0) {
      return Result.fail<DraftPick>('Current team ID must be a positive number');
    }

    if (props.prospectId !== undefined && props.prospectId <= 0) {
      return Result.fail<DraftPick>('Prospect ID must be a positive number');
    }

    if (props.playerId !== undefined && props.playerId <= 0) {
      return Result.fail<DraftPick>('Player ID must be a positive number');
    }

    if (props.originalTeam !== undefined && props.originalTeam <= 0) {
      return Result.fail<DraftPick>('Original team ID must be a positive number');
    }

    // Default values
    const draftPickProps: DraftPickProps = {
      ...props,
      used: props.used !== undefined ? props.used : false,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    // Create the draft pick entity
    return Result.ok<DraftPick>(new DraftPick(draftPickProps));
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

  // Format pick as string (e.g., "Round 1, Pick 12")
  public get formattedPick(): string {
    return `Round ${this.props.round}, Pick ${this.props.pickNumber}`;
  }

  // Format with year (e.g., "2024 Round 1, Pick 12")
  public get formattedPickWithYear(): string {
    return `${this.props.draftYear} ${this.formattedPick}`;
  }

  // Methods to update draft pick properties
  public updatePickDetails(
    round: number,
    pickNumber: number,
    draftYear: number,
  ): Result<DraftPick> {
    if (round <= 0) {
      return Result.fail<DraftPick>('Round must be a positive number');
    }

    if (pickNumber <= 0) {
      return Result.fail<DraftPick>('Pick number must be a positive number');
    }

    if (draftYear <= 0) {
      return Result.fail<DraftPick>('Draft year must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      round,
      pickNumber,
      draftYear,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public updateTeam(teamId: number): Result<DraftPick> {
    if (teamId <= 0) {
      return Result.fail<DraftPick>('Team ID must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      currentTeamId: teamId,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public setOriginalTeam(teamId: number): Result<DraftPick> {
    if (teamId <= 0) {
      return Result.fail<DraftPick>('Original team ID must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      originalTeam: teamId,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public linkToProspect(prospectId: number): Result<DraftPick> {
    if (prospectId <= 0) {
      return Result.fail<DraftPick>('Prospect ID must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      prospectId,
      used: true,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public linkToPlayer(playerId: number): Result<DraftPick> {
    if (playerId <= 0) {
      return Result.fail<DraftPick>('Player ID must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      playerId,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public markAsUsed(): Result<DraftPick> {
    if (this.props.used) {
      return Result.fail<DraftPick>('Draft pick is already used');
    }

    const updatedProps = {
      ...this.props,
      used: true,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  public markAsUnused(): Result<DraftPick> {
    if (!this.props.used) {
      return Result.fail<DraftPick>('Draft pick is already unused');
    }

    const updatedProps = {
      ...this.props,
      used: false,
      prospectId: undefined,
      updatedAt: new Date(),
    };

    return Result.ok<DraftPick>(new DraftPick(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): DraftPickProps {
    return {
      ...this.props,
    };
  }
}
