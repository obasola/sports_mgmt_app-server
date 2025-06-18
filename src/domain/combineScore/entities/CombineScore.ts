// src/domain/combineScore/entities/CombineScore.ts
import { ValidationError } from '@/shared/errors/AppError';

export interface CombineScoreProps {
  id?: number;
  playerId?: number;
  fortyTime?: number;
  tenYardSplit?: number;
  twentyYardShuttle?: number;
  threeCone?: number;
  verticalLeap?: number;
  broadJump?: number;
}

export class CombineScore {
  private constructor(private props: CombineScoreProps) {
    this.validate();
  }

  public static create(props: CombineScoreProps): CombineScore {
    return new CombineScore(props);
  }

  public static fromPersistence(data: {
    id: number;
    playerId?: number | null;
    fortyTime?: number | null;
    tenYardSplit?: number | null;
    twentyYardShuttle?: number | null;
    threeCone?: number | null;
    verticalLeap?: number | null;
    broadJump?: number | null;
  }): CombineScore {
    return new CombineScore({
      id: data.id,
      playerId: data.playerId ?? undefined,
      fortyTime: data.fortyTime ?? undefined,
      tenYardSplit: data.tenYardSplit ?? undefined,
      twentyYardShuttle: data.twentyYardShuttle ?? undefined,
      threeCone: data.threeCone ?? undefined,
      verticalLeap: data.verticalLeap ?? undefined,
      broadJump: data.broadJump ?? undefined,
    });
  }

  private validate(): void {
    // Validate 40 time (typical range: 4.0 - 6.0 seconds)
    if (this.props.fortyTime !== undefined) {
      if (this.props.fortyTime <= 0 || this.props.fortyTime > 10) {
        throw new ValidationError('Forty time must be between 0 and 10 seconds');
      }
    }

    // Validate 10 yard split (typical range: 1.4 - 2.0 seconds)
    if (this.props.tenYardSplit !== undefined) {
      if (this.props.tenYardSplit <= 0 || this.props.tenYardSplit > 5) {
        throw new ValidationError('Ten yard split must be between 0 and 5 seconds');
      }
    }

    // Validate 20 yard shuttle (typical range: 3.8 - 5.0 seconds)
    if (this.props.twentyYardShuttle !== undefined) {
      if (this.props.twentyYardShuttle <= 0 || this.props.twentyYardShuttle > 10) {
        throw new ValidationError('Twenty yard shuttle must be between 0 and 10 seconds');
      }
    }

    // Validate 3 cone drill (typical range: 6.5 - 8.0 seconds)
    if (this.props.threeCone !== undefined) {
      if (this.props.threeCone <= 0 || this.props.threeCone > 15) {
        throw new ValidationError('Three cone drill must be between 0 and 15 seconds');
      }
    }

    // Validate vertical leap (typical range: 25 - 45 inches)
    if (this.props.verticalLeap !== undefined) {
      if (this.props.verticalLeap <= 0 || this.props.verticalLeap > 60) {
        throw new ValidationError('Vertical leap must be between 0 and 60 inches');
      }
    }

    // Validate broad jump (typical range: 100 - 140 inches)
    if (this.props.broadJump !== undefined) {
      if (this.props.broadJump <= 0 || this.props.broadJump > 200) {
        throw new ValidationError('Broad jump must be between 0 and 200 inches');
      }
    }
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get playerId(): number | undefined {
    return this.props.playerId;
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

  // Business methods
  public updateFortyTime(time: number): void {
    if (time <= 0 || time > 10) {
      throw new ValidationError('Forty time must be between 0 and 10 seconds');
    }
    this.props.fortyTime = time;
  }

  public updateTenYardSplit(time: number): void {
    if (time <= 0 || time > 5) {
      throw new ValidationError('Ten yard split must be between 0 and 5 seconds');
    }
    this.props.tenYardSplit = time;
  }

  public updateVerticalLeap(height: number): void {
    if (height <= 0 || height > 60) {
      throw new ValidationError('Vertical leap must be between 0 and 60 inches');
    }
    this.props.verticalLeap = height;
  }

  public updateBroadJump(distance: number): void {
    if (distance <= 0 || distance > 200) {
      throw new ValidationError('Broad jump must be between 0 and 200 inches');
    }
    this.props.broadJump = distance;
  }

  public assignToPlayer(playerId: number): void {
    if (playerId <= 0) {
      throw new ValidationError('Player ID must be positive');
    }
    this.props.playerId = playerId;
  }

  public getOverallAthleticScore(): number {
    // Calculate a composite athletic score based on available metrics
    // This is a business rule that combines multiple combine metrics
    let totalScore = 0;
    let metricCount = 0;

    // Normalize and score each metric (higher is better for athletic ability)
    if (this.props.fortyTime) {
      // Lower time is better, so invert the score (6.0 - actualTime) * 20
      totalScore += Math.max(0, (6.0 - this.props.fortyTime) * 20);
      metricCount++;
    }

    if (this.props.verticalLeap) {
      // Higher jump is better, normalize to 0-100 scale
      totalScore += Math.min(100, this.props.verticalLeap * 2.5);
      metricCount++;
    }

    if (this.props.broadJump) {
      // Higher jump is better, normalize to 0-100 scale  
      totalScore += Math.min(100, this.props.broadJump * 0.8);
      metricCount++;
    }

    if (this.props.twentyYardShuttle) {
      // Lower time is better
      totalScore += Math.max(0, (5.0 - this.props.twentyYardShuttle) * 25);
      metricCount++;
    }

    if (this.props.threeCone) {
      // Lower time is better
      totalScore += Math.max(0, (8.0 - this.props.threeCone) * 12.5);
      metricCount++;
    }

    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  }

  public isCompleteWorkout(): boolean {
    // Check if all major combine metrics are recorded
    return !!(
      this.props.fortyTime &&
      this.props.verticalLeap &&
      this.props.broadJump &&
      this.props.twentyYardShuttle &&
      this.props.threeCone
    );
  }

  public toPersistence(): {
    id?: number;
    playerId?: number;
    fortyTime?: number;
    tenYardSplit?: number;
    twentyYardShuttle?: number;
    threeCone?: number;
    verticalLeap?: number;
    broadJump?: number;
  } {
    return {
      id: this.props.id,
      playerId: this.props.playerId,
      fortyTime: this.props.fortyTime,
      tenYardSplit: this.props.tenYardSplit,
      twentyYardShuttle: this.props.twentyYardShuttle,
      threeCone: this.props.threeCone,
      verticalLeap: this.props.verticalLeap,
      broadJump: this.props.broadJump,
    };
  }

  public equals(other: CombineScore): boolean {
    return this.props.id === other.props.id;
  }
}