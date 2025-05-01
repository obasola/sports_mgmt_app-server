import { z } from 'zod';
import { Player } from '../../domain/player.entity';

// Zod schema for player creation
export const CreatePlayerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  age: z.number().positive('Age must be a positive number'),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  handSize: z.number().positive().optional(),
  armLength: z.number().positive().optional(),
  homeCity: z.string().optional(),
  homeState: z.string().optional(),
  university: z.string().optional(),
  status: z.string().optional(),
  position: z.string().optional(),
  pickId: z.number().positive().optional(),
  combineScoreId: z.number().positive().optional(),
  prospectId: z.number().positive().optional(),
  yearEnteredLeague: z.date().optional(),
});

// Type for player creation
export type CreatePlayerDto = z.infer<typeof CreatePlayerSchema>;

// Zod schema for player update
export const UpdatePlayerSchema = CreatePlayerSchema.partial();

// Type for player update
export type UpdatePlayerDto = z.infer<typeof UpdatePlayerSchema>;

// Zod schema for player filter
export const PlayerFilterSchema = z.object({
  position: z.string().optional(),
  university: z.string().optional(),
  status: z.string().optional(),
  ageMin: z.number().positive().optional(),
  ageMax: z.number().positive().optional(),
});

// Type for player filter
export type PlayerFilterDto = z.infer<typeof PlayerFilterSchema>;

// Response DTO for player
export interface PlayerResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  height?: number;
  weight?: number;
  handSize?: number;
  armLength?: number;
  homeCity?: string;
  homeState?: string;
  university?: string;
  status?: string;
  position?: string;
  pickId?: number;
  combineScoreId?: number;
  prospectId?: number;
  yearEnteredLeague?: Date;
}

// Mapper function to convert Player entity to PlayerResponseDto
export function mapPlayerToDto(player: Player): PlayerResponseDto {
  return {
    id: player.id as number,
    firstName: player.firstName,
    lastName: player.lastName,
    fullName: player.fullName,
    age: player.age,
    height: player.height,
    weight: player.weight,
    handSize: player.handSize,
    armLength: player.armLength,
    homeCity: player.homeCity,
    homeState: player.homeState,
    university: player.university,
    status: player.status,
    position: player.position,
    pickId: player.pickId,
    combineScoreId: player.combineScoreId,
    prospectId: player.prospectId,
    yearEnteredLeague: player.yearEnteredLeague,
  };
}