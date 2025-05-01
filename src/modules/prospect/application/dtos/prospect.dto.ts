import { z } from 'zod';
import { Prospect } from '../../domain/prospect.entity';

// Zod schema for prospect creation
export const CreateProspectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.string().min(1, 'Position is required'),
  college: z.string().min(1, 'College is required'),
  height: z.number().positive('Height must be a positive number'),
  weight: z.number().positive('Weight must be a positive number'),
  handSize: z.number().positive().optional(),
  armLength: z.number().positive().optional(),
  homeCity: z.string().optional(),
  homeState: z.string().optional(),
  fortyTime: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  verticalLeap: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
  twentyYardShuttle: z.number().positive().optional(),
  benchPress: z.number().positive().optional(),
  drafted: z.boolean().optional().default(false),
});

// Type for prospect creation
export type CreateProspectDto = z.infer<typeof CreateProspectSchema>;

// Zod schema for prospect update
export const UpdateProspectSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  college: z.string().min(1).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  handSize: z.number().positive().optional(),
  armLength: z.number().positive().optional(),
  homeCity: z.string().optional(),
  homeState: z.string().optional(),
  fortyTime: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  verticalLeap: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
  twentyYardShuttle: z.number().positive().optional(),
  benchPress: z.number().positive().optional(),
});

// Type for prospect update
export type UpdateProspectDto = z.infer<typeof UpdateProspectSchema>;

// Zod schema for draft prospect
export const DraftProspectSchema = z.object({
  draftYear: z.number().positive('Draft year is required'),
  teamId: z.number().positive('Team ID is required'),
  draftPickId: z.number().positive('Draft pick ID is required'),
});

// Type for draft prospect
export type DraftProspectDto = z.infer<typeof DraftProspectSchema>;

// Zod schema for combine results
export const CombineResultsSchema = z.object({
  fortyTime: z.number().positive().optional(),
  tenYardSplit: z.number().positive().optional(),
  verticalLeap: z.number().positive().optional(),
  broadJump: z.number().positive().optional(),
  threeCone: z.number().positive().optional(),
  twentyYardShuttle: z.number().positive().optional(),
  benchPress: z.number().positive().optional(),
});

// Type for combine results
export type CombineResultsDto = z.infer<typeof CombineResultsSchema>;

// Zod schema for prospect filter
export const ProspectFilterSchema = z.object({
  position: z.string().optional(),
  college: z.string().optional(),
  drafted: z.boolean().optional(),
  draftYear: z.number().positive().optional(),
  teamId: z.number().positive().optional(),
});

// Type for prospect filter
export type ProspectFilterDto = z.infer<typeof ProspectFilterSchema>;

// Response DTO for prospect
export interface ProspectResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  college: string;
  height: number;
  weight: number;
  handSize?: number;
  armLength?: number;
  homeCity?: string;
  homeState?: string;
  fortyTime?: number;
  tenYardSplit?: number;
  verticalLeap?: number;
  broadJump?: number;
  threeCone?: number;
  twentyYardShuttle?: number;
  benchPress?: number;
  drafted: boolean;
  draftYear?: number;
  teamId?: number;
  draftPickId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mapper function to convert Prospect entity to ProspectResponseDto
export function mapProspectToDto(prospect: Prospect): ProspectResponseDto {
  return {
    id: prospect.id as number,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    fullName: prospect.fullName,
    position: prospect.position,
    college: prospect.college,
    height: prospect.height,
    weight: prospect.weight,
    handSize: prospect.handSize,
    armLength: prospect.armLength,
    homeCity: prospect.homeCity,
    homeState: prospect.homeState,
    fortyTime: prospect.fortyTime,
    tenYardSplit: prospect.tenYardSplit,
    verticalLeap: prospect.verticalLeap,
    broadJump: prospect.broadJump,
    threeCone: prospect.threeCone,
    twentyYardShuttle: prospect.twentyYardShuttle,
    benchPress: prospect.benchPress,
    drafted: prospect.drafted,
    draftYear: prospect.draftYear,
    teamId: prospect.teamId,
    draftPickId: prospect.draftPickId,
    createdAt: prospect.createdAt,
    updatedAt: prospect.updatedAt,
  };
}
