import { z } from 'zod';
import { Team } from '../../domain/team.entity';

// Zod schema for team creation
export const CreateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  conference: z.string().optional(),
  division: z.string().optional(),
  stadium: z.string().optional(),
  scheduleId: z.number().positive().optional(),
});

// Type for team creation
export type CreateTeamDto = z.infer<typeof CreateTeamSchema>;

// Zod schema for team update
export const UpdateTeamSchema = CreateTeamSchema.partial();

// Type for team update
export type UpdateTeamDto = z.infer<typeof UpdateTeamSchema>;

// Zod schema for team filter
export const TeamFilterSchema = z.object({
  conference: z.string().optional(),
  division: z.string().optional(),
});

// Type for team filter
export type TeamFilterDto = z.infer<typeof TeamFilterSchema>;

// Response DTO for team
export interface TeamResponseDto {
  id: number;
  name: string;
  fullName: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  stadium?: string;
  scheduleId?: number;
}

// Mapper function to convert Team entity to TeamResponseDto
export function mapTeamToDto(team: Team): TeamResponseDto {
  return {
    id: team.id as number,
    name: team.name,
    fullName: team.fullName,
    city: team.city,
    state: team.state,
    conference: team.conference,
    division: team.division,
    stadium: team.stadium,
    scheduleId: team.scheduleId,
  };
}
