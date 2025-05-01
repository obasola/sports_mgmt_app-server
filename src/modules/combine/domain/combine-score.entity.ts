import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { Result } from '../../../shared/domain/Result';

interface CombineScoreProps {
  id?: number;
  fortyTime?: number;
  tenYardSplit?: number;
  twentyYardShuttle?: number;
  threeCone?: number;
  verticalLeap?: number;
  broadJump?: number;
  playerId?: number;
}

export class CombineScore extends BaseEntity<CombineScoreProps> {
  private constructor(props: CombineScoreProps) {
    super(props);
  }

  /**
   * Factory method to create a new CombineScore entity
   */
  public static create(props: CombineScoreProps): Result<CombineScore> {
    // Validation logic - all fields are optional but should be valid if present
    if (props.fortyTime !== undefined && props.fortyTime <= 0) {
      return Result.fail<CombineScore>('Forty time must be a positive number');
    }

    if (props.tenYardSplit !== undefined && props.tenYardSplit <= 0) {
      return Result.fail<CombineScore>('Ten yard split must be a positive number');
    }

    if (props.twentyYardShuttle !== undefined && props.twentyYardShuttle <= 0) {
      return Result.fail<CombineScore>('Twenty yard shuttle must be a positive number');
    }

    if (props.threeCone !== undefined && props.threeCone <= 0) {
      return Result.fail<CombineScore>('Three cone time must be a positive number');
    }

    if (props.verticalLeap !== undefined && props.verticalLeap <= 0) {
      return Result.fail<CombineScore>('Vertical leap must be a positive number');
    }

    if (props.broadJump !== undefined && props.broadJump <= 0) {
      return Result.fail<CombineScore>('Broad jump must be a positive number');
    }

    if (props.playerId !== undefined && props.playerId <= 0) {
      return Result.fail<CombineScore>('Player ID must be a positive number');
    }

    // Create the combine score entity
    return Result.ok<CombineScore>(new CombineScore(props));
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get fortyTime(): number | undefined {
    return this.props.fortyTime;
  }

  public get tenYardSplit(): number | undefined {
    return this.props.tenYardSplit;
  }

  public get twentyYardShuttle(): number | undefined {
    return this.props.twentyYardShuttle;
  }

  public get threeCone(): number | undefined {
    return this.props.threeCone;
  }

  public get verticalLeap(): number | undefined {
    return this.props.verticalLeap;
  }

  public get broadJump(): number | undefined {
    return this.props.broadJump;
  }

  public get playerId(): number | undefined {
    return this.props.playerId;
  }

  // Methods to update combine score properties
  public updateSpeedMetrics(
    fortyTime?: number,
    tenYardSplit?: number,
    twentyYardShuttle?: number,
    threeCone?: number
  ): Result<CombineScore> {
    if (fortyTime !== undefined && fortyTime <= 0) {
      return Result.fail<CombineScore>('Forty time must be a positive number');
    }

    if (tenYardSplit !== undefined && tenYardSplit <= 0) {
      return Result.fail<CombineScore>('Ten yard split must be a positive number');
    }

    if (twentyYardShuttle !== undefined && twentyYardShuttle <= 0) {
      return Result.fail<CombineScore>('Twenty yard shuttle must be a positive number');
    }

    if (threeCone !== undefined && threeCone <= 0) {
      return Result.fail<CombineScore>('Three cone time must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      fortyTime: fortyTime !== undefined ? fortyTime : this.props.fortyTime,
      tenYardSplit: tenYardSplit !== undefined ? tenYardSplit : this.props.tenYardSplit,
      twentyYardShuttle: twentyYardShuttle !== undefined ? twentyYardShuttle : this.props.twentyYardShuttle,
      threeCone: threeCone !== undefined ? threeCone : this.props.threeCone,
    };

    return Result.ok<CombineScore>(new CombineScore(updatedProps));
  }

  public updateJumpMetrics(
    verticalLeap?: number,
    broadJump?: number
  ): Result<CombineScore> {
    if (verticalLeap !== undefined && verticalLeap <= 0) {
      return Result.fail<CombineScore>('Vertical leap must be a positive number');
    }

    if (broadJump !== undefined && broadJump <= 0) {
      return Result.fail<CombineScore>('Broad jump must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      verticalLeap: verticalLeap !== undefined ? verticalLeap : this.props.verticalLeap,
      broadJump: broadJump !== undefined ? broadJump : this.props.broadJump,
    };

    return Result.ok<CombineScore>(new CombineScore(updatedProps));
  }

  public linkToPlayer(playerId: number): Result<CombineScore> {
    if (playerId <= 0) {
      return Result.fail<CombineScore>('Player ID must be a positive number');
    }

    const updatedProps = {
      ...this.props,
      playerId,
    };

    return Result.ok<CombineScore>(new CombineScore(updatedProps));
  }

  // Convert to a plain object for persistence
  public toObject(): CombineScoreProps {
    return {
      ...this.props
    };
  }
}
