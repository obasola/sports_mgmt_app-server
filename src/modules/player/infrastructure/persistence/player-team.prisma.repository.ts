import { PrismaClient } from '@prisma/client';
import { PlayerTeam } from '../../domain/player-team.entity';
import { PlayerTeamRepository } from '../../domain/player-team.repository';
import { Result } from '../../../../shared/domain/Result';
import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';

export class PlayerTeamPrismaRepository implements PlayerTeamRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient() as any;
  }

  /**
   * Find a player-team relationship by id
   */
  async findById(id: number): Promise<Result<PlayerTeam | null>> {
    try {
      const playerTeamData = await this.prisma.playerTeam.findUnique({
        where: { id },
      });

      if (!playerTeamData) {
        return Result.ok<PlayerTeam | null>(null);
      }

      const playerTeamResult = PlayerTeam.create({
        id: playerTeamData.id,
        playerId: playerTeamData.playerId,
        teamId: playerTeamData.teamId,
        currentTeam: playerTeamData.currentTeam,
        startDate: playerTeamData.startDate || undefined,
        endDate: playerTeamData.endDate || undefined,
      });

      if (playerTeamResult.isFailure) {
        return Result.fail<PlayerTeam | null>(playerTeamResult.error as string);
      }

      return Result.ok<PlayerTeam | null>(playerTeamResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<PlayerTeam | null>(
        `Failed to fetch player-team relationship: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all player-team relationships for a player
   */
  async findByPlayerId(playerId: number): Promise<Result<PlayerTeam[]>> {
    try {
      const playerTeamsData = await this.prisma.playerTeam.findMany({
        where: { playerId },
        orderBy: [{ currentTeam: 'desc' }, { endDate: 'desc' }],
      });

      const playerTeams: PlayerTeam[] = [];

      for (const playerTeamData of playerTeamsData) {
        const playerTeamResult = PlayerTeam.create({
          id: playerTeamData.id,
          playerId: playerTeamData.playerId,
          teamId: playerTeamData.teamId,
          currentTeam: playerTeamData.currentTeam,
          startDate: playerTeamData.startDate || undefined,
          endDate: playerTeamData.endDate || undefined,
        });

        if (playerTeamResult.isSuccess) {
          playerTeams.push(playerTeamResult.getValue());
        }
      }

      return Result.ok<PlayerTeam[]>(playerTeams);
    } catch (error) {
      console.error(`Error in findByPlayerId: ${(error as Error).message}`);
      return Result.fail<PlayerTeam[]>(
        `Failed to fetch player-team relationships for player: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all player-team relationships for a team
   */
  async findByTeamId(teamId: number): Promise<Result<PlayerTeam[]>> {
    try {
      const playerTeamsData = await this.prisma.playerTeam.findMany({
        where: { teamId },
        orderBy: [{ currentTeam: 'desc' }, { startDate: 'desc' }],
      });

      const playerTeams: PlayerTeam[] = [];

      for (const playerTeamData of playerTeamsData) {
        const playerTeamResult = PlayerTeam.create({
          id: playerTeamData.id,
          playerId: playerTeamData.playerId,
          teamId: playerTeamData.teamId,
          currentTeam: playerTeamData.currentTeam,
          startDate: playerTeamData.startDate || undefined,
          endDate: playerTeamData.endDate || undefined,
        });

        if (playerTeamResult.isSuccess) {
          playerTeams.push(playerTeamResult.getValue());
        }
      }

      return Result.ok<PlayerTeam[]>(playerTeams);
    } catch (error) {
      console.error(`Error in findByTeamId: ${(error as Error).message}`);
      return Result.fail<PlayerTeam[]>(
        `Failed to fetch player-team relationships for team: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find the current team for a player
   */
  async findCurrentTeamForPlayer(playerId: number): Promise<Result<PlayerTeam | null>> {
    try {
      const playerTeamData = await this.prisma.playerTeam.findFirst({
        where: {
          playerId,
          currentTeam: true,
        },
      });

      if (!playerTeamData) {
        return Result.ok<PlayerTeam | null>(null);
      }

      const playerTeamResult = PlayerTeam.create({
        id: playerTeamData.id,
        playerId: playerTeamData.playerId,
        teamId: playerTeamData.teamId,
        currentTeam: playerTeamData.currentTeam,
        startDate: playerTeamData.startDate || undefined,
        endDate: playerTeamData.endDate || undefined,
      });

      if (playerTeamResult.isFailure) {
        return Result.fail<PlayerTeam | null>(playerTeamResult.error as string);
      }

      return Result.ok<PlayerTeam | null>(playerTeamResult.getValue());
    } catch (error) {
      console.error(`Error in findCurrentTeamForPlayer: ${(error as Error).message}`);
      return Result.fail<PlayerTeam | null>(
        `Failed to fetch current team for player: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Find all current players for a team
   */
  async findCurrentPlayersForTeam(teamId: number): Promise<Result<PlayerTeam[]>> {
    try {
      const playerTeamsData = await this.prisma.playerTeam.findMany({
        where: {
          teamId,
          currentTeam: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });

      const playerTeams: PlayerTeam[] = [];

      for (const playerTeamData of playerTeamsData) {
        const playerTeamResult = PlayerTeam.create({
          id: playerTeamData.id,
          playerId: playerTeamData.playerId,
          teamId: playerTeamData.teamId,
          currentTeam: playerTeamData.currentTeam,
          startDate: playerTeamData.startDate || undefined,
          endDate: playerTeamData.endDate || undefined,
        });

        if (playerTeamResult.isSuccess) {
          playerTeams.push(playerTeamResult.getValue());
        }
      }

      return Result.ok<PlayerTeam[]>(playerTeams);
    } catch (error) {
      console.error(`Error in findCurrentPlayersForTeam: ${(error as Error).message}`);
      return Result.fail<PlayerTeam[]>(
        `Failed to fetch current players for team: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a new player-team relationship
   */
  async create(playerTeam: PlayerTeam): Promise<Result<PlayerTeam>> {
    try {
      const playerTeamData = playerTeam.toObject();

      // Remove id if it exists to let the database generate it
      if (playerTeamData.id !== undefined) {
        delete (playerTeamData as any).id;
      }

      // If this is set as the current team, update any existing current team
      if (playerTeamData.currentTeam) {
        await this.prisma.playerTeam.updateMany({
          where: {
            playerId: playerTeamData.playerId,
            currentTeam: true,
          },
          data: {
            currentTeam: false,
            endDate: new Date(),
          },
        });
      }

      const createdPlayerTeam = await this.prisma.playerTeam.create({
        data: playerTeamData,
      });

      const playerTeamResult = PlayerTeam.create({
        id: createdPlayerTeam.id,
        playerId: createdPlayerTeam.playerId,
        teamId: createdPlayerTeam.teamId,
        currentTeam: createdPlayerTeam.currentTeam,
        startDate: createdPlayerTeam.startDate || undefined,
        endDate: createdPlayerTeam.endDate || undefined,
      });

      if (playerTeamResult.isFailure) {
        return Result.fail<PlayerTeam>(playerTeamResult.error as string);
      }

      return Result.ok<PlayerTeam>(playerTeamResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<PlayerTeam>(
        `Failed to create player-team relationship: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Update an existing player-team relationship
   */
  async update(id: number, playerTeam: PlayerTeam): Promise<Result<PlayerTeam>> {
    try {
      const playerTeamData = playerTeam.toObject();

      // Ensure the correct ID is used
      delete (playerTeamData as any).id;

      // If this is set as the current team, update any existing current team
      if (playerTeamData.currentTeam) {
        const existingPlayerTeam = await this.prisma.playerTeam.findUnique({
          where: { id },
        });

        if (existingPlayerTeam && !existingPlayerTeam.currentTeam) {
          await this.prisma.playerTeam.updateMany({
            where: {
              playerId: playerTeamData.playerId,
              currentTeam: true,
              id: { not: id },
            },
            data: {
              currentTeam: false,
              endDate: new Date(),
            },
          });
        }
      }

      const updatedPlayerTeam = await this.prisma.playerTeam.update({
        where: { id },
        data: playerTeamData,
      });

      const playerTeamResult = PlayerTeam.create({
        id: updatedPlayerTeam.id,
        playerId: updatedPlayerTeam.playerId,
        teamId: updatedPlayerTeam.teamId,
        currentTeam: updatedPlayerTeam.currentTeam,
        startDate: updatedPlayerTeam.startDate || undefined,
        endDate: updatedPlayerTeam.endDate || undefined,
      });

      if (playerTeamResult.isFailure) {
        return Result.fail<PlayerTeam>(playerTeamResult.error as string);
      }

      return Result.ok<PlayerTeam>(playerTeamResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<PlayerTeam>(
        `Failed to update player-team relationship: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Delete a player-team relationship
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.playerTeam.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(
        `Failed to delete player-team relationship: ${(error as Error).message}`,
      );
    }
  }
}
