// src/application/draftpick/dto/DraftPickDto.ts
import { z } from 'zod';

// Base schema without refinement for reusability
const BaseDraftPickDtoSchema = z.object({
  round: z.number().min(1, 'Round must be at least 1').max(7, 'Round cannot exceed 7'),
  pickNumber: z.number().min(1, 'Pick number must be at least 1').max(300, 'Pick number cannot exceed 300'),
  draftYear: z.number().min(1990, 'Draft year too early').max(2030, 'Draft year too far in future'),
  currentTeamId: z.number().positive('Current team ID is required'),
  prospectId: z.number().positive().optional(),
  playerId: z.number().positive().optional(),
  used: z.boolean().default(false),
  originalTeam: z.number().positive().optional(),
});

export const CreateDraftPickDtoSchema = BaseDraftPickDtoSchema.refine(
  (data) => !(data.prospectId && data.playerId),
  {
    message: "Cannot assign both prospect and player to the same draft pick",
    path: ["prospectId", "playerId"],
  }
);

export const UpdateDraftPickDtoSchema = BaseDraftPickDtoSchema.partial().omit({
  pickNumber: true,
  draftYear: true,
}).refine(
  (data) => !(data.prospectId && data.playerId),
  {
    message: "Cannot assign both prospect and player to the same draft pick",
    path: ["prospectId", "playerId"],
  }
);

export const UseDraftPickDtoSchema = z.object({
  prospectId: z.number().positive('Prospect ID is required'),
});

export const AssignPlayerDtoSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
});

export const TradeDraftPickDtoSchema = z.object({
  newTeamId: z.number().positive('New team ID is required'),
});

export const DraftPickFiltersDtoSchema = z.object({
  round: z.number().min(1).max(7).optional(),
  draftYear: z.number().min(1990).max(2030).optional(),
  currentTeamId: z.number().positive().optional(),
  originalTeam: z.number().positive().optional(),
  used: z.boolean().optional(),
  prospectId: z.number().positive().optional(),
  playerId: z.number().positive().optional(),
  minPickNumber: z.number().min(1).optional(),
  maxPickNumber: z.number().max(300).optional(),
  isFirstRound: z.boolean().optional(),
  hasProspect: z.boolean().optional(),
  hasPlayer: z.boolean().optional(),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const BulkCreateDraftPicksDtoSchema = z.object({
  draftYear: z.number().min(1990).max(2030),
  rounds: z.number().min(1).max(7).default(7),
  picksPerRound: z.number().min(1).max(50).default(32),
  teams: z.array(z.number().positive()).min(1, 'At least one team is required'),
});

export type CreateDraftPickDto = z.infer<typeof CreateDraftPickDtoSchema>;
export type UpdateDraftPickDto = z.infer<typeof UpdateDraftPickDtoSchema>;
export type UseDraftPickDto = z.infer<typeof UseDraftPickDtoSchema>;
export type AssignPlayerDto = z.infer<typeof AssignPlayerDtoSchema>;
export type TradeDraftPickDto = z.infer<typeof TradeDraftPickDtoSchema>;
export type DraftPickFiltersDto = z.infer<typeof DraftPickFiltersDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;
export type BulkCreateDraftPicksDto = z.infer<typeof BulkCreateDraftPicksDtoSchema>;

export interface DraftPickResponseDto {
  id: number;
  round: number;
  pickNumber: number;
  draftYear: number;
  currentTeamId: number;
  currentTeamName?: string;
  prospectId?: number;
  prospectName?: string;
  playerId?: number;
  playerName?: string;
  used: boolean;
  originalTeam?: number;
  originalTeamName?: string;
  pickValue: number;
  pickDescription: string;
  isFirstRoundPick: boolean;
  isCompensatoryPick: boolean;
  isTraded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftPickSummaryDto {
  totalPicks: number;
  usedPicks: number;
  unusedPicks: number;
  tradedPicks: number;
  firstRoundPicks: number;
  compensatoryPicks: number;
  picksByRound: {
    round: number;
    count: number;
    used: number;
    unused: number;
  }[];
  picksByTeam: {
    teamId: number;
    teamName?: string;
    count: number;
    used: number;
    unused: number;
  }[];
}

export interface DraftYearStatsDto {
  draftYear: number;
  totalPicks: number;
  totalTeams: number;
  roundsCompleted: number;
  picksUsed: number;
  picksRemaining: number;
  tradedPicks: number;
  compensatoryPicks: number;
  averagePickValue: number;
  summary: DraftPickSummaryDto;
}