import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface PlayerTeamProps {
  id?: number;
  playerId: number;
  teamId: number;
  currentTeam: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class PlayerTeam extends BaseEntity<PlayerTeamProps> {
  private constructor(props: PlayerTeamProps) {
    super(props);
  }

  /**
   * Factory method to create a new PlayerTeam entity
   */
  public static create(props: PlayerTeamProps): Result<PlayerTeam> {
    // Validation logic
    if (!props.playerId || props.playerId <= 0) {
      return Result.fail<PlayerTeam>('Valid player ID is required');
    }

    if (!props.teamId || props.teamId <= 0) {
      return Result.fail<PlayerTeam>('Valid team ID is required');
    }

    if (props.startDate && props.endDate && props.startDate > props.endDate) {
      return Result.fail<PlayerTeam>('Start date cannot be after end date');
    }

    // Create the player-team entity
    return Result.ok<PlayerTeam>(new PlayerTeam(props));
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get playerId(): number {
    return this.props.playerId;
  }

  public get teamId(): number {
    return this.props.teamId;
  }

  public get currentTeam(): boolean {
    return this.props.currentTeam;
  }

  public get startDate(): Date | undefined {
    return this.props.startDate;
  }

  public get endDate(): Date | undefined {
    return this.props.endDate;
  }

  // Methods to update properties
  public makeCurrentTeam(): Result<PlayerTeam> {
    const updatedProps = {
      ...this.props,
      currentTeam: true,
    };

    return Result.ok<PlayerTeam>(new PlayerTeam(updatedProps));
  }

  public makeFormerTeam(): Result<PlayerTeam> {
    if (!this.props.endDate) {
      const updatedProps = {
        ...this.props,
        currentTeam: false,
        endDate: new Date(),
      };

      return Result.ok<PlayerTeam>(new PlayerTeam(updatedProps));
    } else {
      const updatedProps = {
        ...this.props,
        currentTeam: false,
      };

      return Result.ok<PlayerTeam>(new PlayerTeam(updatedProps));
    }
  }

  public updateDates(startDate?: Date, endDate?: Date): Result<PlayerTeam> {
    if (startDate && endDate && startDate > endDate) {
      return Result.fail<PlayerTeam>('Start date cannot be after end date');
    }

    const updatedProps = {
      ...this.props,
      startDate: startDate !== undefined ? startDate : this.props.startDate,
      endDate: endDate !== undefined ? endDate : this.props.endDate,
    };

    return Result.ok<PlayerTeam>(new PlayerTeam(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): PlayerTeamProps {
    return {
      ...this.props,
    };
  }
}
