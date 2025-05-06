export interface DraftPickWithDetailsDTO {
  id: number;
  draftYear: number;
  round: number;
  pickNumber: number;
  playerId?: number;
  teamId: number;
  playerFirstName?: string;
  playerLastName?: string;
  teamName?: string;
  // Additional optional fields for team history queries
  playerTeamStartDate?: Date;
  playerTeamEndDate?: Date;
}
