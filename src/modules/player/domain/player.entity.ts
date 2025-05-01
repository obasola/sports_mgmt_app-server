import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface PlayerProps {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  height?: number;
  weight?: number;
  handSize?: number;
  armLength?: number;
  homeCity?: string;
  homeState?: string;
  university?: string;
  status?: string;
  position?: string;
  pickId?: number;
  combineScoreId?: number;
  prospectId?: number;
  yearEnteredLeague?: Date;
}

export class Player extends BaseEntity<PlayerProps> {
  private constructor(props: PlayerProps) {
    super(props);
  }

  /**
   * Factory method to create a new Player entity
   */
  public static create(props: PlayerProps): Result<Player> {
    // Validation logic
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<Player>('First name is required');
    }

    if (!props.lastName || props.lastName.trim().length === 0) {
      return Result.fail<Player>('Last name is required');
    }

    if (props.age <= 0) {
      return Result.fail<Player>('Age must be a positive number');
    }

    // Create the player entity
    return Result.ok<Player>(new Player(props));
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

  public get age(): number {
    return this.props.age;
  }

  public get height(): number | undefined {
    return this.props.height;
  }

  public get weight(): number | undefined {
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

  public get university(): string | undefined {
    return this.props.university;
  }

  public get status(): string | undefined {
    return this.props.status;
  }

  public get position(): string | undefined {
    return this.props.position;
  }

  public get pickId(): number | undefined {
    return this.props.pickId;
  }

  public get combineScoreId(): number | undefined {
    return this.props.combineScoreId;
  }

  public get prospectId(): number | undefined {
    return this.props.prospectId;
  }

  public get yearEnteredLeague(): Date | undefined {
    return this.props.yearEnteredLeague;
  }

  // Methods to update player properties
  public updatePersonalInfo(firstName: string, lastName: string, age: number): Result<Player> {
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail<Player>('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      return Result.fail<Player>('Last name is required');
    }

    if (age <= 0) {
      return Result.fail<Player>('Age must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      firstName,
      lastName,
      age,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public updatePhysicalAttributes(
    height?: number,
    weight?: number,
    handSize?: number,
    armLength?: number,
  ): Result<Player> {
    const updatedProps = {
      ...this.props,
      height: height !== undefined ? height : this.props.height,
      weight: weight !== undefined ? weight : this.props.weight,
      handSize: handSize !== undefined ? handSize : this.props.handSize,
      armLength: armLength !== undefined ? armLength : this.props.armLength,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public updatePlayerDetails(
    position?: string,
    status?: string,
    university?: string,
    yearEnteredLeague?: Date,
  ): Result<Player> {
    const updatedProps = {
      ...this.props,
      position: position !== undefined ? position : this.props.position,
      status: status !== undefined ? status : this.props.status,
      university: university !== undefined ? university : this.props.university,
      yearEnteredLeague:
        yearEnteredLeague !== undefined ? yearEnteredLeague : this.props.yearEnteredLeague,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public updateHomeLocation(homeCity?: string, homeState?: string): Result<Player> {
    const updatedProps = {
      ...this.props,
      homeCity: homeCity !== undefined ? homeCity : this.props.homeCity,
      homeState: homeState !== undefined ? homeState : this.props.homeState,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public linkToCombineScore(combineScoreId: number): Result<Player> {
    if (combineScoreId <= 0) {
      return Result.fail<Player>('Invalid combine score ID');
    }

    const updatedProps = {
      ...this.props,
      combineScoreId,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public linkToProspect(prospectId: number): Result<Player> {
    if (prospectId <= 0) {
      return Result.fail<Player>('Invalid prospect ID');
    }

    const updatedProps = {
      ...this.props,
      prospectId,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  public linkToDraftPick(pickId: number): Result<Player> {
    if (pickId <= 0) {
      return Result.fail<Player>('Invalid draft pick ID');
    }

    const updatedProps = {
      ...this.props,
      pickId,
    };

    return Result.ok<Player>(new Player(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): PlayerProps {
    return {
      ...this.props,
    };
  }
}
