// src/application/draft/dto/DraftSelection.ts

export class DraftSelection {
  constructor(
    public readonly pickId: number,
    public readonly prospectId: number,
    public readonly teamId: number,
    public readonly selectionTime: Date,
    public readonly round?: number,
    public readonly pickNumber?: number,
    public readonly teamName?: string,
    public readonly playerName?: string,
    public readonly position?: string,
    public readonly college?: string
  ) {}

  static fromDatabase(data: any): DraftSelection {
    return new DraftSelection(
      data.pickId,
      data.prospectId,
      data.teamId,
      data.selectionTime,
      data.round,
      data.pickNumber,
      data.teamName,
      data.playerName,
      data.position,
      data.college
    )
  }

  toResponse() {
    return {
      pickId: this.pickId,
      prospectId: this.prospectId,
      teamId: this.teamId,
      selectionTime: this.selectionTime,
      round: this.round,
      pickNumber: this.pickNumber,
      teamName: this.teamName,
      playerName: this.playerName,
      position: this.position,
      college: this.college
    }
  }
}