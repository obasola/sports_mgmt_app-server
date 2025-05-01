import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface ProspectProps {
  id?: number;
  firstName: string;
  lastName: string;
  position: string;
  college: string;
  height: number;
  weight: number;
  handSize?: number;
  armLength?: number;
  homeCity?: string;
  homeState?: string;
  fortyTime?: number;
  tenYardSplit?: number;
  verticalLeap?: number;
  broadJump?: number;
  threeCone?: number;
  twentyYardShuttle?: number;
  benchPress?: number;
  drafted: boolean;
  draftYear?: number;
  teamId?: number;
  draftPickId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Prospect extends BaseEntity<ProspectProps> {
  private constructor(props: ProspectProps) {
    super(props);
  }

  /**
   * Factory method to create a new Prospect entity
   */
  public static create(props: ProspectProps): Result<Prospect> {
    // Validation logic
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<Prospect>('First name is required');
    }

    if (!props.lastName || props.lastName.trim().length === 0) {
      return Result.fail<Prospect>('Last name is required');
    }

    if (!props.position || props.position.trim().length === 0) {
      return Result.fail<Prospect>('Position is required');
    }

    if (!props.college || props.college.trim().length === 0) {
      return Result.fail<Prospect>('College is required');
    }

    if (!props.height || props.height <= 0) {
      return Result.fail<Prospect>('Height must be a positive number');
    }

    if (!props.weight || props.weight <= 0) {
      return Result.fail<Prospect>('Weight must be a positive number');
    }

    // Create the prospect entity with default values if needed
    const prospectProps: ProspectProps = {
      ...props,
      drafted: props.drafted !== undefined ? props.drafted : false,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    return Result.ok<Prospect>(new Prospect(prospectProps));
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  public get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  public get position(): string {
    return this.props.position;
  }

  public get college(): string {
    return this.props.college;
  }

  public get height(): number {
    return this.props.height;
  }

  public get weight(): number {
    return this.props.weight;
  }

  public get handSize(): number | undefined {
    return this.props.handSize;
  }

  public get armLength(): number | undefined {
    return this.props.armLength;
  }

  public get homeCity(): string | undefined {
    return this.props.homeCity;
  }

  public get homeState(): string | undefined {
    return this.props.homeState;
  }

  public get fortyTime(): number | undefined {
    return this.props.fortyTime;
  }

  public get tenYardSplit(): number | undefined {
    return this.props.tenYardSplit;
  }

  public get verticalLeap(): number | undefined {
    return this.props.verticalLeap;
  }

  public get broadJump(): number | undefined {
    return this.props.broadJump;
  }

  public get threeCone(): number | undefined {
    return this.props.threeCone;
  }

  public get twentyYardShuttle(): number | undefined {
    return this.props.twentyYardShuttle;
  }

  public get benchPress(): number | undefined {
    return this.props.benchPress;
  }

  public get drafted(): boolean {
    return this.props.drafted;
  }

  public get draftYear(): number | undefined {
    return this.props.draftYear;
  }

  public get teamId(): number | undefined {
    return this.props.teamId;
  }

  public get draftPickId(): number | undefined {
    return this.props.draftPickId;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Methods to update prospect properties
  public updatePersonalInfo(
    firstName: string,
    lastName: string,
    position: string,
    college: string,
  ): Result<Prospect> {
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail<Prospect>('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      return Result.fail<Prospect>('Last name is required');
    }

    if (!position || position.trim().length === 0) {
      return Result.fail<Prospect>('Position is required');
    }

    if (!college || college.trim().length === 0) {
      return Result.fail<Prospect>('College is required');
    }

    const updatedProps = {
      ...this.props,
      firstName,
      lastName,
      position,
      college,
      updatedAt: new Date(),
    };

    return Result.ok<Prospect>(new Prospect(updatedProps));
  }

  public updatePhysicalAttributes(
    height: number,
    weight: number,
    handSize?: number,
    armLength?: number,
  ): Result<Prospect> {
    if (!height || height <= 0) {
      return Result.fail<Prospect>('Height must be a positive number');
    }

    if (!weight || weight <= 0) {
      return Result.fail<Prospect>('Weight must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      height,
      weight,
      handSize: handSize !== undefined ? handSize : this.props.handSize,
      armLength: armLength !== undefined ? armLength : this.props.armLength,
      updatedAt: new Date(),
    };

    return Result.ok<Prospect>(new Prospect(updatedProps));
  }

  public updateCombineResults(
    fortyTime?: number,
    tenYardSplit?: number,
    verticalLeap?: number,
    broadJump?: number,
    threeCone?: number,
    twentyYardShuttle?: number,
    benchPress?: number,
  ): Result<Prospect> {
    const updatedProps = {
      ...this.props,
      fortyTime: fortyTime !== undefined ? fortyTime : this.props.fortyTime,
      tenYardSplit: tenYardSplit !== undefined ? tenYardSplit : this.props.tenYardSplit,
      verticalLeap: verticalLeap !== undefined ? verticalLeap : this.props.verticalLeap,
      broadJump: broadJump !== undefined ? broadJump : this.props.broadJump,
      threeCone: threeCone !== undefined ? threeCone : this.props.threeCone,
      twentyYardShuttle:
        twentyYardShuttle !== undefined ? twentyYardShuttle : this.props.twentyYardShuttle,
      benchPress: benchPress !== undefined ? benchPress : this.props.benchPress,
      updatedAt: new Date(),
    };

    return Result.ok<Prospect>(new Prospect(updatedProps));
  }

  public updateHomeLocation(homeCity?: string, homeState?: string): Result<Prospect> {
    const updatedProps = {
      ...this.props,
      homeCity: homeCity !== undefined ? homeCity : this.props.homeCity,
      homeState: homeState !== undefined ? homeState : this.props.homeState,
      updatedAt: new Date(),
    };

    return Result.ok<Prospect>(new Prospect(updatedProps));
  }

  public markAsDrafted(draftYear: number, teamId: number, draftPickId: number): Result<Prospect> {
    if (!draftYear || draftYear <= 0) {
      return Result.fail<Prospect>('Draft year is required and must be positive');
    }

    if (!teamId || teamId <= 0) {
      return Result.fail<Prospect>('Team ID is required and must be positive');
    }

    if (!draftPickId || draftPickId <= 0) {
      return Result.fail<Prospect>('Draft pick ID is required and must be positive');
    }

    const updatedProps = {
      ...this.props,
      drafted: true,
      draftYear,
      teamId,
      draftPickId,
      updatedAt: new Date(),
    };

    return Result.ok<Prospect>(new Prospect(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): ProspectProps {
    return {
      ...this.props,
    };
  }
}
