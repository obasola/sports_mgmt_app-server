// src/application/combineScore/dto/CombineScoreDto.ts
import { z } from 'zod';

export const CreateCombineScoreDtoSchema = z.object({
  playerId: z.number().positive().optional(),
  fortyTime: z.number().positive().max(10, 'Forty time too high').optional(),
  tenYardSplit: z.number().positive().max(5, 'Ten yard split too high').optional(),
  twentyYardShuttle: z.number().positive().max(10, 'Twenty yard shuttle too high').optional(),
  threeCone: z.number().positive().max(15, 'Three cone too high').optional(),
  verticalLeap: z.number().positive().max(60, 'Vertical leap too high').optional(),
  broadJump: z.number().positive().max(200, 'Broad jump too high').optional(),
});

export const UpdateCombineScoreDtoSchema = CreateCombineScoreDtoSchema.partial();

export const CombineScoreFiltersDtoSchema = z.object({
  playerId: z.number().positive().optional(),
  fortyTimeMin: z.number().positive().optional(),
  fortyTimeMax: z.number().positive().max(10).optional(),
  verticalLeapMin: z.number().positive().optional(),
  verticalLeapMax: z.number().positive().max(60).optional(),
  broadJumpMin: z.number().positive().optional(),
  broadJumpMax: z.number().positive().max(200).optional(),
  hasCompleteWorkout: z.boolean().optional(),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const TopPerformersDtoSchema = z.object({
  metric: z.enum(['fortyTime', 'tenYardSplit', 'twentyYardShuttle', 'threeCone', 'verticalLeap', 'broadJump']),
  limit: z.number().min(1).max(50).optional().default(10),
});

export const AthleticScoreRangeDtoSchema = z.object({
  minScore: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
}).refine((data) => data.minScore <= data.maxScore, {
  message: "Min score must be less than or equal to max score",
});

export type CreateCombineScoreDto = z.infer<typeof CreateCombineScoreDtoSchema>;
export type UpdateCombineScoreDto = z.infer<typeof UpdateCombineScoreDtoSchema>;
export type CombineScoreFiltersDto = z.infer<typeof CombineScoreFiltersDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;
export type TopPerformersDto = z.infer<typeof TopPerformersDtoSchema>;
export type AthleticScoreRangeDto = z.infer<typeof AthleticScoreRangeDtoSchema>;

export interface CombineScoreResponseDto {
  id: number;
  playerId?: number;
  fortyTime?: number;
  tenYardSplit?: number;
  twentyYardShuttle?: number;
  threeCone?: number;
  verticalLeap?: number;
  broadJump?: number;
  overallAthleticScore: number;
  isCompleteWorkout: boolean;
  // Computed fields for better API response
  fortyTimeFormatted?: string;
  verticalLeapFormatted?: string;
  broadJumpFormatted?: string;
}