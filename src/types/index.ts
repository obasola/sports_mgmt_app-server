import { Prisma } from '@prisma/client';

// Player types
export type PlayerCreateInput = Prisma.PlayerCreateInput;
export type PlayerUpdateInput = Prisma.PlayerUpdateInput;

// Team types
export type TeamCreateInput = Prisma.TeamCreateInput;
export type TeamUpdateInput = Prisma.TeamUpdateInput;

// Pick types
export type PickCreateInput = Prisma.PickCreateInput;
export type PickUpdateInput = Prisma.PickUpdateInput;

// Combine_Score types
export type CombineScoreCreateInput = Prisma.Combine_ScoreCreateInput;
export type CombineScoreUpdateInput = Prisma.Combine_ScoreUpdateInput;

// Player_Award types
export type PlayerAwardCreateInput = Prisma.Player_AwardCreateInput;
export type PlayerAwardUpdateInput = Prisma.Player_AwardUpdateInput;

// Player_Team types
export type PlayerTeamCreateInput = Prisma.Player_TeamCreateInput;
export type PlayerTeamUpdateInput = Prisma.Player_TeamUpdateInput;

// Post_Season_Result types
export type PostSeasonResultCreateInput = Prisma.Post_Season_ResultCreateInput;
export type PostSeasonResultUpdateInput = Prisma.Post_Season_ResultUpdateInput;

// Schedule types
export type ScheduleCreateInput = Prisma.ScheduleCreateInput;
export type ScheduleUpdateInput = Prisma.ScheduleUpdateInput;

// Person types
export type PersonCreateInput = Prisma.PersonCreateInput;
export type PersonUpdateInput = Prisma.PersonUpdateInput;

// Error response type
export interface ErrorResponse {
  error: string;
  details?: any;
}