// src/domain/prospect/entity/Prospect.ts

export class Prospect {
  constructor(
    public readonly id: number | undefined,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly position: string,
    public readonly college: string,
    public readonly height?: number,
    public readonly weight?: number,
    public readonly handSize?: number,
    public readonly armLength?: number,
    public readonly homeCity?: string,
    public readonly homeState?: string,
    public readonly fortyTime?: number,
    public readonly tenYardSplit?: number,
    public readonly verticalLeap?: number,
    public readonly broadJump?: number,
    public readonly threeCone?: number,
    public readonly twentyYardShuttle?: number,
    public readonly benchPress?: number,
    public readonly drafted: boolean = false,
    public readonly draftYear?: number,
    public readonly teamId?: number,
    public readonly draftPickId?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static fromDatabase(data: any): Prospect {
    return new Prospect(
      data.id,
      data.firstName,
      data.lastName,
      data.position,
      data.college,
      data.height,
      data.weight,
      data.handSize,
      data.armLength,
      data.homeCity,
      data.homeState,
      data.fortyTime,
      data.tenYardSplit,
      data.verticalLeap,
      data.broadJump,
      data.threeCone,
      data.twentyYardShuttle,
      data.benchPress,
      data.drafted,
      data.draftYear,
      data.teamId,
      data.draftPickId,
      data.createdAt,
      data.updatedAt
    )
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  isAvailable(): boolean {
    return !this.drafted
  }

  get displayHeight(): string {
    if (!this.height) return 'N/A'
    const feet = Math.floor(this.height / 12)
    const inches = this.height % 12
    return `${feet}'${inches}"`
  }
}
