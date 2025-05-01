import { z } from 'zod';
import { PlayerTeam } from '../../domain/player-team.entity';

// Zod schema for player-team creation
export const CreatePlayerTeamSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
  teamId: z.number().positive('Team ID is required'),
  currentTeam: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Type for player-team creation
export type CreatePlayerTeamDto = z.infer<typeof CreatePlayerTeamSchema>;

// Zod schema for player-team update
export const UpdatePlayerTeamSchema = z.object({
  currentTeam: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Type for player-team update
export type UpdatePlayerTeamDto = z.infer<typeof UpdatePlayerTeamSchema>;

// Zod schema for player transfer
export const TransferPlayerSchema = z.object({
  playerId: z.number().positive('Player ID is required'),
  teamId: z.number().positive('Team ID is required'),
  transferDate: z
    .date()
    .optional()
    .default(() => new Date()),
});

// Type for player transfer
export type TransferPlayerDto = z.infer<typeof TransferPlayerSchema>;

// Response DTO for player-team
export interface PlayerTeamResponseDto {
  id: number;
  playerId: number;
  teamId: number;
  currentTeam: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Mapper function to convert PlayerTeam entity to PlayerTeamResponseDto
export function mapPlayerTeamToDto(playerTeam: PlayerTeam): PlayerTeamResponseDto {
  return {
    id: playerTeam.id as number,
    playerId: playerTeam.playerId,
    teamId: playerTeam.teamId,
    currentTeam: playerTeam.currentTeam,
    startDate: playerTeam.startDate,
    endDate: playerTeam.endDate,
  };
}
