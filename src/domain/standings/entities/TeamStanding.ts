export class TeamStanding {
  constructor(
    public teamId: number,
    public teamName: string,
    public division: string,
    public conference: string,
    public wins = 0,
    public losses = 0,
    public ties = 0,
    public pointsFor = 0,
    public pointsAgainst = 0,
    public streak = '',
    public divisionWins = 0,
    public divisionLosses = 0,
    public conferenceWins = 0,
    public conferenceLosses = 0
  ) {}

  get winPct() {
    const total = this.wins + this.losses + this.ties;
    return total === 0 ? 0 : (this.wins + 0.5 * this.ties) / total;
  }

  get pointDiff() {
    return this.pointsFor - this.pointsAgainst;
  }
}

