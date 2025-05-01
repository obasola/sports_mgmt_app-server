// src/modules/playerAward/domain/PlayerAward.ts
export class PlayerAward {
  constructor(
    public readonly id: number,
    public readonly playerId: number,
    public awardName: string | null,
    public yearAwarded: number | null,
  ) {
    if (!playerId || playerId <= 0) throw new Error('Invalid player ID');
    if (yearAwarded && (yearAwarded < 1900 || yearAwarded > new Date().getFullYear())) {
      throw new Error('Invalid award year');
    }
  }
  // Convert to plain object for persistence
  toObject() {
    return {
      id: this.id,
      playerId: this.playerId,
      awardName: this.awardName,
      yearAwarded: this.yearAwarded,
    };
  }
}
