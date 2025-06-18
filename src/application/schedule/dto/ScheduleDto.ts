// src/application/schedule/dto/ScheduleDto.ts
import { z } from 'zod';

export const CreateScheduleDtoSchema = z.object({
  teamId: z.number().positive().optional(),
  seasonYear: z.number().min(1990).max(2030).optional(),
  oppTeamId: z.number().positive('Opponent team ID is required'),
  oppTeamConference: z.string().max(45).optional(),
  oppTeamDivision: z.string().max(45).optional(),
  scheduleWeek: z.number().min(1).max(20).optional(),
  gameDate: z.string().transform((str) => new Date(str)).optional(),
  gameCity: z.string().max(45).optional(),
  gameStateProvince: z.string().max(45).optional(),
  gameCountry: z.string().max(45).optional(),
  gameLocation: z.string().max(75).optional(),
  wonLostFlag: z.string().length(1).optional(),
  homeOrAway: z.string().length(1).optional(),
  oppTeamScore: z.number().min(0).optional(),
  teamScore: z.number().min(0).optional(),
});

export const UpdateScheduleDtoSchema = CreateScheduleDtoSchema.partial();

export const ScheduleFiltersDtoSchema = z.object({
  teamId: z.number().positive().optional(),
  seasonYear: z.number().min(1990).max(2030).optional(),
  oppTeamId: z.number().positive().optional(),
  oppTeamConference: z.string().optional(),
  oppTeamDivision: z.string().optional(),
  scheduleWeek: z.number().min(1).max(20).optional(),
  gameCity: z.string().optional(),
  gameStateProvince: z.string().optional(),
  gameCountry: z.string().optional(),
  wonLostFlag: z.string().length(1).optional(),
  homeOrAway: z.string().length(1).optional(),
  completed: z.boolean().optional(),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type CreateScheduleDto = z.infer<typeof CreateScheduleDtoSchema>;
export type UpdateScheduleDto = z.infer<typeof UpdateScheduleDtoSchema>;
export type ScheduleFiltersDto = z.infer<typeof ScheduleFiltersDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;

export interface ScheduleResponseDto {
  id: number;
  teamId?: number;
  seasonYear?: number;
  oppTeamId: number;
  oppTeamConference?: string;
  oppTeamDivision?: string;
  scheduleWeek?: number;
  gameDate?: string;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  gameLocation?: string;
  wonLostFlag?: string;
  homeOrAway?: string;
  oppTeamScore?: number;
  teamScore?: number;
  gameCompleted: boolean;
  gameResult?: string;
  isHomeGame: boolean;
  fullGameLocation: string;
}
