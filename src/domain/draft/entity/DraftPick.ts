// src/domain/draft/entity/DraftPick.ts
 
export class DraftPick {
  currentTeam: boolean = false;
  prospect: boolean = false;
  
  constructor(
    public readonly id: number | undefined,
    public readonly round: number,
    public readonly pickNumber: number,
    public readonly draftYear: number,
    public readonly currentTeamId: number,
    public readonly originalTeam?: number,
    public readonly prospectId?: number,
    public readonly playerId?: number,
    public readonly used: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static fromDatabase(data: any): DraftPick {
    return new DraftPick(
      data.id,
      data.round,
      data.pickNumber,
      data.draftYear,
      data.currentTeamId,
      data.originalTeam,
      data.prospectId,
      data.playerId,
      data.used,
      data.createdAt,
      data.updatedAt
    )
  }

  isAvailable(): boolean {
    return !this.used
  }

  belongsToTeam(teamId: number): boolean {
    return this.currentTeamId === teamId
  }
}

