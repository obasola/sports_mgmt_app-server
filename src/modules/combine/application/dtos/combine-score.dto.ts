import { z } from 'zod';
import { CombineScore } from '../../domain/combine-score.entity';

// Zod schema for combine score creation
export const CreateCombineScoreSchema = z.object({
  fortyTime: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  twentyYardShuttle: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
  verticalLeap: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
  playerId: z.number().positive().optional(),
});

// Type for combine score creation
export type CreateCombineScoreDto = z.infer<typeof CreateCombineScoreSchema>;

// Zod schema for combine score update
export const UpdateCombineScoreSchema = CreateCombineScoreSchema.partial();

// Type for combine score update
export type UpdateCombineScoreDto = z.infer<typeof UpdateCombineScoreSchema>;

// Zod schema for speed metrics update
export const SpeedMetricsSchema = z.object({
  fortyTime: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  twentyYardShuttle: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
});

// Type for speed metrics update
export type SpeedMetricsDto = z.infer<typeof SpeedMetricsSchema>;

// Zod schema for jump metrics update
export const JumpMetricsSchema = z.object({
  verticalLeap: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
});

// Type for jump metrics update
export type JumpMetricsDto = z.infer<typeof JumpMetricsSchema>;

// Zod schema for player link
export const PlayerLinkSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
});

// Type for player link
export type PlayerLinkDto = z.infer<typeof PlayerLinkSchema>;

// Zod schema for combine score filter
export const CombineScoreFilterSchema = z.object({
  fortyTimeLessThan: z.number().positive().optional(),
  verticalLeapGreaterThan: z.number().positive().optional(),
  broadJumpGreaterThan: z.number().positive().optional(),
});

// Type for combine score filter
export type CombineScoreFilterDto = z.infer<typeof CombineScoreFilterSchema>;

// Response DTO for combine score
export interface CombineScoreResponseDto {
  id: number;
  fortyTime?: number;
  tenYardSplit?: number;
  twentyYardShuttle?: number;
  threeCone?: number;
  verticalLeap?: number;
  broadJump?: number;
  playerId?: number;
}

// Mapper function to convert CombineScore entity to CombineScoreResponseDto
export function mapCombineScoreToDto(combineScore: CombineScore): CombineScoreResponseDto {
  return {
    id: combineScore.id as number,
    fortyTime: combineScore.fortyTime,
    tenYardSplit: combineScore.tenYardSplit,
    twentyYardShuttle: combineScore.twentyYardShuttle,
    threeCone: combineScore.threeCone,
    verticalLeap: combineScore.verticalLeap,
    broadJump: combineScore.broadJump,
    playerId: combineScore.playerId,
  };
}
