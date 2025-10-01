// src/presentation/validators/params.ts
import { z } from "zod";

/** For path params like /teams/:teamId */
export const TeamIdParamSchema = z.object({
  teamId: z.coerce.number().int().positive(), // turns "12" -> 12
});

/** For query ?teamId=..&seasonYear=..&seasonType=..&week=.. */
export const TeamSeasonQuerySchema = z.object({
  teamId: z.coerce.number().int().positive().optional(),
  seasonYear: z
    .string()
    .regex(/^\d{4}$/, "seasonYear must be a 4-digit year")
    .optional(),
  // IMPORTANT: default to regular season unless caller says otherwise
  seasonType: z.coerce.number().int().min(1).max(3).default(2).optional(),
  week: z.coerce.number().int().min(0).max(25).optional(),
});

/** Opponent param when needed */
export const OpponentParamsSchema = z.object({
  oppTeamId: z.coerce.number().int().positive(),
});
