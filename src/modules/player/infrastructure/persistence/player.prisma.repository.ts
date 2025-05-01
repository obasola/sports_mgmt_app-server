import { PrismaClient } from '@prisma/client';
import { Player } from '../../domain/player.entity';
import { PlayerRepository } from '../../domain/player.repository';
import { Result } from '../../../../shared/domain/Result';
import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';

export class PlayerPrismaRepository implements PlayerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient();
  }

  /**
   * Find a player by id
   */
  async findById(id: number): Promise<Result<Player | null>> {
    try {
      const playerData = await this.prisma.player.findUnique({
        where: { id },
      });

      if (!playerData) {
        return Result.ok<Player | null>(null);
      }

      const playerResult = Player.create({
        id: playerData.id,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        age: playerData.age,
        height: playerData.height || undefined,
        weight: playerData.weight || undefined,
        handSize: playerData.handSize || undefined,
        armLength: playerData.armLength || undefined,
        homeCity: playerData.homeCity || undefined,
        homeState: playerData.homeState || undefined,
        university: playerData.university || undefined,
        status: playerData.status || undefined,
        position: playerData.position || undefined,
        pickId: playerData.pickId || undefined,
        combineScoreId: playerData.combineScoreId || undefined,
        prospectId: playerData.prospectId || undefined,
        yearEnteredLeague: playerData.yearEnteredLeague || undefined,
      });

      if (playerResult.isFailure) {
        return Result.fail<Player | null>(playerResult.error as string);
      }

      return Result.ok<Player | null>(playerResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<Player | null>(`Failed to fetch player: ${(error as Error).message}`);
    }
  }

  /**
   * Find all players with optional pagination
   */
  async findAll(limit = 100, offset = 0): Promise<Result<Player[]>> {
    try {
      const playersData = await this.prisma.player.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          lastName: 'asc',
        },
      });

      const players: Player[] = [];

      for (const playerData of playersData) {
        const playerResult = Player.create({
          id: playerData.id,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          age: playerData.age,
          height: playerData.height || undefined,
          weight: playerData.weight || undefined,
          handSize: playerData.handSize || undefined,
          armLength: playerData.armLength || undefined,
          homeCity: playerData.homeCity || undefined,
          homeState: playerData.homeState || undefined,
          university: playerData.university || undefined,
          status: playerData.status || undefined,
          position: playerData.position || undefined,
          pickId: playerData.pickId || undefined,
          combineScoreId: playerData.combineScoreId || undefined,
          prospectId: playerData.prospectId || undefined,
          yearEnteredLeague: playerData.yearEnteredLeague || undefined,
        });

        if (playerResult.isSuccess) {
          players.push(playerResult.getValue());
        }
      }

      return Result.ok<Player[]>(players);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<Player[]>(`Failed to fetch players: ${(error as Error).message}`);
    }
  }

  /**
   * Find players by filters
   */
  async findByFilters(
    filters: Partial<{
      position: string;
      university: string;
      status: string;
      ageMin: number;
      ageMax: number;
    }>,
  ): Promise<Result<Player[]>> {
    try {
      const where: any = {};

      if (filters.position) {
        where.position = filters.position;
      }

      if (filters.university) {
        where.university = filters.university;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
        where.age = {};

        if (filters.ageMin !== undefined) {
          where.age.gte = filters.ageMin;
        }

        if (filters.ageMax !== undefined) {
          where.age.lte = filters.ageMax;
        }
      }

      const playersData = await this.prisma.player.findMany({
        where,
        orderBy: {
          lastName: 'asc',
        },
      });

      const players: Player[] = [];

      for (const playerData of playersData) {
        const playerResult = Player.create({
          id: playerData.id,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          age: playerData.age,
          height: playerData.height || undefined,
          weight: playerData.weight || undefined,
          handSize: playerData.handSize || undefined,
          armLength: playerData.armLength || undefined,
          homeCity: playerData.homeCity || undefined,
          homeState: playerData.homeState || undefined,
          university: playerData.university || undefined,
          status: playerData.status || undefined,
          position: playerData.position || undefined,
          pickId: playerData.pickId || undefined,
          combineScoreId: playerData.combineScoreId || undefined,
          prospectId: playerData.prospectId || undefined,
          yearEnteredLeague: playerData.yearEnteredLeague || undefined,
        });

        if (playerResult.isSuccess) {
          players.push(playerResult.getValue());
        }
      }

      return Result.ok<Player[]>(players);
    } catch (error) {
      console.error(`Error in findByFilters: ${(error as Error).message}`);
      return Result.fail<Player[]>(
        `Failed to fetch players by filters: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a new player
   */
  async create(player: Player): Promise<Result<Player>> {
    try {
      const playerData = player.toObject();

      // Remove id if it exists to let the database generate it
      if (playerData.id !== undefined) {
        delete (playerData as any).id;
      }

      const createdPlayer = await this.prisma.player.create({
        data: playerData,
      });

      const playerResult = Player.create({
        id: createdPlayer.id,
        firstName: createdPlayer.firstName,
        lastName: createdPlayer.lastName,
        age: createdPlayer.age,
        height: createdPlayer.height || undefined,
        weight: createdPlayer.weight || undefined,
        handSize: createdPlayer.handSize || undefined,
        armLength: createdPlayer.armLength || undefined,
        homeCity: createdPlayer.homeCity || undefined,
        homeState: createdPlayer.homeState || undefined,
        university: createdPlayer.university || undefined,
        status: createdPlayer.status || undefined,
        position: createdPlayer.position || undefined,
        pickId: createdPlayer.pickId || undefined,
        combineScoreId: createdPlayer.combineScoreId || undefined,
        prospectId: createdPlayer.prospectId || undefined,
        yearEnteredLeague: createdPlayer.yearEnteredLeague || undefined,
      });

      if (playerResult.isFailure) {
        return Result.fail<Player>(playerResult.error as string);
      }

      return Result.ok<Player>(playerResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<Player>(`Failed to create player: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing player
   */
  async update(id: number, player: Player): Promise<Result<Player>> {
    try {
      const playerData = player.toObject();

      // Ensure the correct ID is used
      delete (playerData as any).id;

      const updatedPlayer = await this.prisma.player.update({
        where: { id },
        data: playerData,
      });

      const playerResult = Player.create({
        id: updatedPlayer.id,
        firstName: updatedPlayer.firstName,
        lastName: updatedPlayer.lastName,
        age: updatedPlayer.age,
        height: updatedPlayer.height || undefined,
        weight: updatedPlayer.weight || undefined,
        handSize: updatedPlayer.handSize || undefined,
        armLength: updatedPlayer.armLength || undefined,
        homeCity: updatedPlayer.homeCity || undefined,
        homeState: updatedPlayer.homeState || undefined,
        university: updatedPlayer.university || undefined,
        status: updatedPlayer.status || undefined,
        position: updatedPlayer.position || undefined,
        pickId: updatedPlayer.pickId || undefined,
        combineScoreId: updatedPlayer.combineScoreId || undefined,
        prospectId: updatedPlayer.prospectId || undefined,
        yearEnteredLeague: updatedPlayer.yearEnteredLeague || undefined,
      });

      if (playerResult.isFailure) {
        return Result.fail<Player>(playerResult.error as string);
      }

      return Result.ok<Player>(playerResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<Player>(`Failed to update player: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a player
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.player.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete player: ${(error as Error).message}`);
    }
  }

  /**
   * Find players for a specific team
   */
  async findByTeamId(teamId: number): Promise<Result<Player[]>> {
    try {
      const playerTeams = await this.prisma.playerTeam.findMany({
        where: { teamId },
        include: { player: true },
      });

      const players: Player[] = [];

      for (const { player: playerData } of playerTeams) {
        const playerResult = Player.create({
          id: playerData.id,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          age: playerData.age,
          height: playerData.height || undefined,
          weight: playerData.weight || undefined,
          handSize: playerData.handSize || undefined,
          armLength: playerData.armLength || undefined,
          homeCity: playerData.homeCity || undefined,
          homeState: playerData.homeState || undefined,
          university: playerData.university || undefined,
          status: playerData.status || undefined,
          position: playerData.position || undefined,
          pickId: playerData.pickId || undefined,
          combineScoreId: playerData.combineScoreId || undefined,
          prospectId: playerData.prospectId || undefined,
          yearEnteredLeague: playerData.yearEnteredLeague || undefined,
        });

        if (playerResult.isSuccess) {
          players.push(playerResult.getValue());
        }
      }

      return Result.ok<Player[]>(players);
    } catch (error) {
      console.error(`Error in findByTeamId: ${(error as Error).message}`);
      return Result.fail<Player[]>(
        `Failed to fetch players by team ID: ${(error as Error).message}`,
      );
    }
  }
}
