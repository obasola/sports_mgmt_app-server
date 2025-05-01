import { z } from 'zod';
import { DraftPick } from '../../domain/draft-pick.entity';

// Zod schema for draft pick creation
export const CreateDraftPickSchema = z.object({
  round: z.number().positive('Round must be a positive number'),
  pickNumber: z.number().positive('Pick number must be a positive number'),
  draftYear: z.number().positive('Draft year must be a positive number'),
  currentTeamId: z.number().positive('Current team ID must be a positive number'),
  prospectId: z.number().positive().optional(),
  playerId: z.number().positive().optional(),
  used: z.boolean().optional().default(false),
  originalTeam: z.number().positive().optional(),
});

// Type for draft pick creation
export type CreateDraftPickDto = z.infer<typeof CreateDraftPickSchema>;

// Zod schema for draft pick update
export const UpdateDraftPickSchema = z.object({
  round: z.number().positive().optional(),
  pickNumber: z.number().positive().optional(),
  draftYear: z.number().positive().optional(),
  currentTeamId: z.number().positive().optional(),
  prospectId: z.number().positive().optional(),
  playerId: z.number().positive().optional(),
  used: z.boolean().optional(),
  originalTeam: z.number().positive().optional(),
});

// Type for draft pick update
export type UpdateDraftPickDto = z.infer<typeof UpdateDraftPickSchema>;

// Zod schema for using a draft pick
export const UseDraftPickSchema = z.object({
  prospectId: z.number().positive('Prospect ID is required'),
});

// Type for using a draft pick
export type UseDraftPickDto = z.infer<typeof UseDraftPickSchema>;

// Zod schema for trading a draft pick
export const TradeDraftPickSchema = z.object({
  teamId: z.number().positive('Team ID is required'),
});

// Type for trading a draft pick
export type TradeDraftPickDto = z.infer<typeof TradeDraftPickSchema>;

// Zod schema for setting original team
export const OriginalTeamSchema = z.object({
  teamId: z.number().positive('Team ID is required'),
});

// Type for setting original team
export type OriginalTeamDto = z.infer<typeof OriginalTeamSchema>;

// Zod schema for draft pick filter
export const DraftPickFilterSchema = z.object({
  round: z.number().positive().optional(),
  pickNumber: z.number().positive().optional(),
  draftYear: z.number().positive().optional(),
  currentTeamId: z.number().positive().optional(),
  used: z.boolean().optional(),
  originalTeam: z.number().positive().optional(),
});

// Type for draft pick filter
export type DraftPickFilterDto = z.infer<typeof DraftPickFilterSchema>;

// Response DTO for draft pick
export interface DraftPickResponseDto {
  id: number;
  round: number;
  pickNumber: number;
  draftYear: number;
  currentTeamId: number;
  prospectId?: number;
  playerId?: number;
  used: boolean;
  originalTeam?: number;
  createdAt?: Date;
  updatedAt?: Date;
  formattedPick: string;
  formattedPickWithYear: string;
}

// Mapper function to convert DraftPick entity to DraftPickResponseDto
export function mapDraftPickToDto(draftPick: DraftPick): DraftPickResponseDto {
  return {
    id: draftPick.id as number,
    round: draftPick.round,
    pickNumber: draftPick.pickNumber,
    draftYear: draftPick.draftYear,
    currentTeamId: draftPick.currentTeamId,
    prospectId: draftPick.prospectId,
    playerId: draftPick.playerId,
    used: draftPick.used,
    originalTeam: draftPick.originalTeam,
    createdAt: draftPick.createdAt,
    updatedAt: draftPick.updatedAt,
    formattedPick: draftPick.formattedPick,
    formattedPickWithYear: draftPick.formattedPickWithYear,
  };
}
