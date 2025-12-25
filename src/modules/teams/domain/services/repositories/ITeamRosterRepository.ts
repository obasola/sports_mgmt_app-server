export interface RosterPlayer {
  playerId: number;
  firstName: string;
  lastName: string;
  age: number | null;
  position: string | null;
  currentTeam: boolean;
  isActive: number | null; // tinyint in DB
  startYear: number | null;
  endYear: number | null;
}

export interface ITeamRosterRepository {
  getCurrentRoster(teamId: number): Promise<RosterPlayer[]>;
}

