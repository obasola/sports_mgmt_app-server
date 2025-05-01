import { PrismaClient } from '@prisma/client';
import { Team } from '../../domain/team.entity';
import { TeamRepository } from '../../domain/team.repository';
import { Result } from '../../../../shared/domain/Result';
import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';

export class TeamPrismaRepository implements TeamRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient() as any;
  }

  /**
   * Find a team by id
   */
  async findById(id: number): Promise<Result<Team | null>> {
    try {
      const teamData = await this.prisma.team.findUnique({
        where: { id },
      });

      if (!teamData) {
        return Result.ok<Team | null>(null);
      }

      const teamResult = Team.create({
        id: teamData.id,
        name: teamData.name,
        city: teamData.city || undefined,
        state: teamData.state || undefined,
        conference: teamData.conference || undefined,
        division: teamData.division || undefined,
        stadium: teamData.stadium || undefined,
        scheduleId: teamData.scheduleId || undefined,
      });

      if (teamResult.isFailure) {
        return Result.fail<Team | null>(teamResult.error as string);
      }

      return Result.ok<Team | null>(teamResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<Team | null>(`Failed to fetch team: ${(error as Error).message}`);
    }
  }

  /**
   * Find all teams
   */
  async findAll(): Promise<Result<Team[]>> {
    try {
      const teamsData = await this.prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      const teams: Team[] = [];

      for (const teamData of teamsData) {
        const teamResult = Team.create({
          id: teamData.id,
          name: teamData.name,
          city: teamData.city || undefined,
          state: teamData.state || undefined,
          conference: teamData.conference || undefined,
          division: teamData.division || undefined,
          stadium: teamData.stadium || undefined,
          scheduleId: teamData.scheduleId || undefined,
        });

        if (teamResult.isSuccess) {
          teams.push(teamResult.getValue());
        }
      }

      return Result.ok<Team[]>(teams);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<Team[]>(`Failed to fetch teams: ${(error as Error).message}`);
    }
  }

  /**
   * Find teams by filters
   */
  async findByFilters(
    filters: Partial<{
      conference: string;
      division: string;
    }>,
  ): Promise<Result<Team[]>> {
    try {
      const where: any = {};

      if (filters.conference) {
        where.conference = filters.conference;
      }

      if (filters.division) {
        where.division = filters.division;
      }

      const teamsData = await this.prisma.team.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      });

      const teams: Team[] = [];

      for (const teamData of teamsData) {
        const teamResult = Team.create({
          id: teamData.id,
          name: teamData.name,
          city: teamData.city || undefined,
          state: teamData.state || undefined,
          conference: teamData.conference || undefined,
          division: teamData.division || undefined,
          stadium: teamData.stadium || undefined,
          scheduleId: teamData.scheduleId || undefined,
        });

        if (teamResult.isSuccess) {
          teams.push(teamResult.getValue());
        }
      }

      return Result.ok<Team[]>(teams);
    } catch (error) {
      console.error(`Error in findByFilters: ${(error as Error).message}`);
      return Result.fail<Team[]>(`Failed to fetch teams by filters: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new team
   */
  async create(team: Team): Promise<Result<Team>> {
    try {
      const teamData = team.toObject();

      // Remove id if it exists to let the database generate it
      if (teamData.id !== undefined) {
        delete (teamData as any).id;
      }

      const createdTeam = await this.prisma.team.create({
        data: teamData,
      });

      const teamResult = Team.create({
        id: createdTeam.id,
        name: createdTeam.name,
        city: createdTeam.city || undefined,
        state: createdTeam.state || undefined,
        conference: createdTeam.conference || undefined,
        division: createdTeam.division || undefined,
        stadium: createdTeam.stadium || undefined,
        scheduleId: createdTeam.scheduleId || undefined,
      });

      if (teamResult.isFailure) {
        return Result.fail<Team>(teamResult.error as string);
      }

      return Result.ok<Team>(teamResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<Team>(`Failed to create team: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing team
   */
  async update(id: number, team: Team): Promise<Result<Team>> {
    try {
      const teamData = team.toObject();

      // Ensure the correct ID is used
      delete (teamData as any).id;

      const updatedTeam = await this.prisma.team.update({
        where: { id },
        data: teamData,
      });

      const teamResult = Team.create({
        id: updatedTeam.id,
        name: updatedTeam.name,
        city: updatedTeam.city || undefined,
        state: updatedTeam.state || undefined,
        conference: updatedTeam.conference || undefined,
        division: updatedTeam.division || undefined,
        stadium: updatedTeam.stadium || undefined,
        scheduleId: updatedTeam.scheduleId || undefined,
      });

      if (teamResult.isFailure) {
        return Result.fail<Team>(teamResult.error as string);
      }

      return Result.ok<Team>(teamResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<Team>(`Failed to update team: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a team
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.team.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete team: ${(error as Error).message}`);
    }
  }

  /**
   * Find team by name
   */
  async findByName(name: string): Promise<Result<Team | null>> {
    try {
      const teamData = await this.prisma.team.findFirst({
        where: {
          name: {
            contains: name,
          },
        },
      });

      if (!teamData) {
        return Result.ok<Team | null>(null);
      }

      const teamResult = Team.create({
        id: teamData.id,
        name: teamData.name,
        city: teamData.city || undefined,
        state: teamData.state || undefined,
        conference: teamData.conference || undefined,
        division: teamData.division || undefined,
        stadium: teamData.stadium || undefined,
        scheduleId: teamData.scheduleId || undefined,
      });

      if (teamResult.isFailure) {
        return Result.fail<Team | null>(teamResult.error as string);
      }

      return Result.ok<Team | null>(teamResult.getValue());
    } catch (error) {
      console.error(`Error in findByName: ${(error as Error).message}`);
      return Result.fail<Team | null>(`Failed to fetch team by name: ${(error as Error).message}`);
    }
  }

  /**
   * Find teams by conference and division
   */
  async findByConferenceAndDivision(
    conference: string,
    division?: string,
  ): Promise<Result<Team[]>> {
    try {
      const where: any = { conference };

      if (division) {
        where.division = division;
      }

      const teamsData = await this.prisma.team.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      });

      const teams: Team[] = [];

      for (const teamData of teamsData) {
        const teamResult = Team.create({
          id: teamData.id,
          name: teamData.name,
          city: teamData.city || undefined,
          state: teamData.state || undefined,
          conference: teamData.conference || undefined,
          division: teamData.division || undefined,
          stadium: teamData.stadium || undefined,
          scheduleId: teamData.scheduleId || undefined,
        });

        if (teamResult.isSuccess) {
          teams.push(teamResult.getValue());
        }
      }

      return Result.ok<Team[]>(teams);
    } catch (error) {
      console.error(`Error in findByConferenceAndDivision: ${(error as Error).message}`);
      return Result.fail<Team[]>(
        `Failed to fetch teams by conference and division: ${(error as Error).message}`,
      );
    }
  }
}
