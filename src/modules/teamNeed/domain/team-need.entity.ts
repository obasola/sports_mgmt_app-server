// src/modules/teamNeed/domain/team-need.entity.ts
export class TeamNeed {
  public id: number;
  public teamId: number;
  public position: string;
  public priority: number;
  public createdAt: Date;
  public updatedAt: Date;
  public draftYear?: Date;

  constructor(
    id: number,
    teamId: number,
    position: string,
    priority = 1,
    createdAt?: Date,
    updatedAt?: Date,
    draftYear?: Date,
  ) {
    this.id = id;
    this.teamId = teamId;
    this.position = position;
    this.priority = priority;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.draftYear = draftYear;
  }

  // Factory method
  static create(params: Partial<TeamNeed> & { teamId: number; position: string }): TeamNeed {
    return new TeamNeed(
      params.id || 0,
      params.teamId,
      params.position,
      params.priority,
      params.createdAt,
      params.updatedAt,
      params.draftYear,
    );
  }

  // Business logic methods
  incrementPriority(): void {
    this.priority++;
    this.updatedAt = new Date();
  }

  decrementPriority(): void {
    if (this.priority > 1) {
      this.priority--;
      this.updatedAt = new Date();
    }
  }

  updatePosition(position: string): void {
    this.position = position;
    this.updatedAt = new Date();
  }

  updateDraftYear(draftYear: Date): void {
    this.draftYear = draftYear;
    this.updatedAt = new Date();
  }

  // Validation method
  validate(): string[] {
    const errors: string[] = [];

    if (!this.teamId || this.teamId <= 0) {
      errors.push('Team ID is required and must be positive');
    }

    if (!this.position || this.position.trim().length === 0) {
      errors.push('Position is required');
    }

    if (this.priority <= 0) {
      errors.push('Priority must be positive');
    }

    return errors;
  }

  toString(): string {
    return `TeamNeed[id=${this.id}, team=${this.teamId}, position=${this.position}, priority=${this.priority}]`;
  }
}
