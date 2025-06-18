// src/application/playerteam/dto/PlayerTeamDto.ts
import { z } from 'zod';

// ✅ Base schema without refinement for easy .partial() usage
const BaseCreatePlayerTeamDtoSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
  teamId: z.number().positive('Team ID is required'),
  jerseyNumber: z.number().min(0, 'Jersey number cannot be negative').max(99, 'Jersey number cannot exceed 99').optional(),
  currentTeam: z.boolean().default(true),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  contractValue: z.number().min(0, 'Contract value cannot be negative').optional(),
  contractLength: z.number().min(1, 'Contract length must be at least 1 year').max(10, 'Contract length cannot exceed 10 years').optional(),
});

// ✅ Create schema with refinement
export const CreatePlayerTeamDtoSchema = BaseCreatePlayerTeamDtoSchema.refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Contract start date must be before or equal to end date',
  path: ['endDate'],
});

// ✅ Update schema using base schema (no refinement) for .partial() to work
export const UpdatePlayerTeamDtoSchema = BaseCreatePlayerTeamDtoSchema.partial().omit({
  playerId: true,
  teamId: true,
});

export const PlayerTeamFiltersDtoSchema = z.object({
  playerId: z.number().positive().optional(),
  teamId: z.number().positive().optional(),
  jerseyNumber: z.number().min(0).max(99).optional(),
  currentTeam: z.boolean().optional(),
  contractValue: z.number().min(0).optional(),
  contractLength: z.number().min(1).max(10).optional(),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type CreatePlayerTeamDto = z.infer<typeof CreatePlayerTeamDtoSchema>;
export type UpdatePlayerTeamDto = z.infer<typeof UpdatePlayerTeamDtoSchema>;
export type PlayerTeamFiltersDto = z.infer<typeof PlayerTeamFiltersDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;

export interface PlayerTeamResponseDto {
  id: number;
  playerId: number;
  teamId: number;
  jerseyNumber: number | null;
  currentTeam: boolean;
  startDate: string | null; // ISO date string for API responses
  endDate: string | null; // ISO date string for API responses
  contractValue: number | null;
  contractLength: number | null;
  isContractActive: boolean; // Computed field
  
  // Relationship data (included when available)
  player?: {
    id: number;
    firstName: string;
    lastName: string;
    position?: string;
    fullName?: string; // Computed field
  } | null;
  team?: {
    id: number;
    name: string;
    city: string;           // Will be empty string if null in DB
    conference?: string;
    division?: string;
    fullName?: string; // Computed field
  } | null;
}