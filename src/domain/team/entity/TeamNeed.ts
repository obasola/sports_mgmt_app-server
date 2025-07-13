// src/domain/team/entity/TeamNeed.ts
 
export class TeamNeed {
  constructor(
    public readonly id: number | undefined,
    public readonly teamId: number,
    public readonly position: string,
    public readonly priority: number,
    public readonly draftYear?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static fromDatabase(data: any): TeamNeed {
    return new TeamNeed(
      data.id,
      data.teamId,
      data.position,
      data.priority,
      data.draftYear,
      data.createdAt,
      data.updatedAt
    )
  }

  isHighPriority(): boolean {
    return this.priority <= 2
  }

  isMediumPriority(): boolean {
    return this.priority >= 3 && this.priority <= 5
  }

  isLowPriority(): boolean {
    return this.priority > 5
  }
}