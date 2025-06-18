// src/application/playerAward/dto/PlayerAwardDto.ts

import { z } from 'zod';

export const CreatePlayerAwardDtoSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
  awardName: z.string().max(45, 'Award name cannot exceed 45 characters').optional(),
  yearAwarded: z.number().min(1950, 'Year must be 1950 or later').max(2030, 'Year cannot exceed 2030').optional(),
});

export const UpdatePlayerAwardDtoSchema = CreatePlayerAwardDtoSchema.partial();

export const PlayerAwardFiltersDtoSchema = z.object({
  playerId: z.number().positive().optional(),
  awardName: z.string().optional(),
  yearAwarded: z.number().min(1950).max(2030).optional(),
  yearFrom: z.number().min(1950).max(2030).optional(),
  yearTo: z.number().min(1950).max(2030).optional(),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type CreatePlayerAwardDto = z.infer<typeof CreatePlayerAwardDtoSchema>;
export type UpdatePlayerAwardDto = z.infer<typeof UpdatePlayerAwardDtoSchema>;
export type PlayerAwardFiltersDto = z.infer<typeof PlayerAwardFiltersDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;

export interface PlayerAwardResponseDto {
  id: number;
  playerId: number;
  awardName?: string;
  yearAwarded?: number;
  displayName: string;
  isRecentAward: boolean;
}