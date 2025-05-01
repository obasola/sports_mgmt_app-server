import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface TeamProps {
  id?: number;
  name: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  stadium?: string;
  scheduleId?: number;
}

export class Team extends BaseEntity<TeamProps> {
  private constructor(props: TeamProps) {
    super(props);
  }

  /**
   * Factory method to create a new Team entity
   */
  public static create(props: TeamProps): Result<Team> {
    // Validation logic
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Team>('Team name is required');
    }

    // Create the team entity
    return Result.ok<Team>(new Team(props));
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get city(): string | undefined {
    return this.props.city;
  }

  public get state(): string | undefined {
    return this.props.state;
  }

  public get conference(): string | undefined {
    return this.props.conference;
  }

  public get division(): string | undefined {
    return this.props.division;
  }

  public get stadium(): string | undefined {
    return this.props.stadium;
  }

  public get scheduleId(): number | undefined {
    return this.props.scheduleId;
  }

  public get fullName(): string {
    return this.props.city ? `${this.props.city} ${this.props.name}` : this.props.name;
  }

  // Methods to update team properties
  public updateBasicInfo(name: string, city?: string, state?: string): Result<Team> {
    if (!name || name.trim().length === 0) {
      return Result.fail<Team>('Team name is required');
    }

    const updatedProps = {
      ...this.props,
      name,
      city: city !== undefined ? city : this.props.city,
      state: state !== undefined ? state : this.props.state,
    };

    return Result.ok<Team>(new Team(updatedProps));
  }

  public updateOrganizationInfo(conference?: string, division?: string): Result<Team> {
    const updatedProps = {
      ...this.props,
      conference: conference !== undefined ? conference : this.props.conference,
      division: division !== undefined ? division : this.props.division,
    };

    return Result.ok<Team>(new Team(updatedProps));
  }

  public updateStadium(stadium: string): Result<Team> {
    if (!stadium || stadium.trim().length === 0) {
      return Result.fail<Team>('Stadium name cannot be empty');
    }

    const updatedProps = {
      ...this.props,
      stadium,
    };

    return Result.ok<Team>(new Team(updatedProps));
  }

  public linkToSchedule(scheduleId: number): Result<Team> {
    if (scheduleId <= 0) {
      return Result.fail<Team>('Invalid schedule ID');
    }

    const updatedProps = {
      ...this.props,
      scheduleId,
    };

    return Result.ok<Team>(new Team(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): TeamProps {
    return {
      ...this.props,
    };
  }
}
