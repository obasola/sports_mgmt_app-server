import { PrismaClient } from '@prisma/client';
import { Prospect } from '../../domain/prospect.entity';
import { ProspectRepository } from '../../domain/prospect.repository';
import { Result } from '../../../../shared/domain/Result';
import { PrismaService } from '../../../../shared/infrastructure/persistence/prisma.service';

export class ProspectPrismaRepository implements ProspectRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient() as any;
  }

  /**
   * Find a prospect by id
   */
  async findById(id: number): Promise<Result<Prospect | null>> {
    try {
      const prospectData = await this.prisma.prospect.findUnique({
        where: { id },
      });

      if (!prospectData) {
        return Result.ok<Prospect | null>(null);
      }

      const prospectResult = Prospect.create({
        id: prospectData.id,
        firstName: prospectData.firstName,
        lastName: prospectData.lastName,
        position: prospectData.position,
        college: prospectData.college,
        height: prospectData.height,
        weight: prospectData.weight,
        handSize: prospectData.handSize || undefined,
        armLength: prospectData.armLength || undefined,
        homeCity: prospectData.homeCity || undefined,
        homeState: prospectData.homeState || undefined,
        fortyTime: prospectData.fortyTime || undefined,
        tenYardSplit: prospectData.tenYardSplit || undefined,
        verticalLeap: prospectData.verticalLeap || undefined,
        broadJump: prospectData.broadJump || undefined,
        threeCone: prospectData.threeCone || undefined,
        twentyYardShuttle: prospectData.twentyYardShuttle || undefined,
        benchPress: prospectData.benchPress || undefined,
        drafted: prospectData.drafted,
        draftYear: prospectData.draftYear || undefined,
        teamId: prospectData.teamId || undefined,
        draftPickId: prospectData.draftPickId || undefined,
        createdAt: prospectData.createdAt || undefined,
        updatedAt: prospectData.updatedAt || undefined,
      });

      if (prospectResult.isFailure) {
        return Result.fail<Prospect | null>(prospectResult.error as string);
      }

      return Result.ok<Prospect | null>(prospectResult.getValue());
    } catch (error) {
      console.error(`Error in findById: ${(error as Error).message}`);
      return Result.fail<Prospect | null>(`Failed to fetch prospect: ${(error as Error).message}`);
    }
  }

  /**
   * Find all prospects
   */
  async findAll(limit = 100, offset = 0): Promise<Result<Prospect[]>> {
    try {
      const prospectsData = await this.prisma.prospect.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          lastName: 'asc',
        },
      });

      const prospects: Prospect[] = [];

      for (const prospectData of prospectsData) {
        const prospectResult = Prospect.create({
          id: prospectData.id,
          firstName: prospectData.firstName,
          lastName: prospectData.lastName,
          position: prospectData.position,
          college: prospectData.college,
          height: prospectData.height,
          weight: prospectData.weight,
          handSize: prospectData.handSize || undefined,
          armLength: prospectData.armLength || undefined,
          homeCity: prospectData.homeCity || undefined,
          homeState: prospectData.homeState || undefined,
          fortyTime: prospectData.fortyTime || undefined,
          tenYardSplit: prospectData.tenYardSplit || undefined,
          verticalLeap: prospectData.verticalLeap || undefined,
          broadJump: prospectData.broadJump || undefined,
          threeCone: prospectData.threeCone || undefined,
          twentyYardShuttle: prospectData.twentyYardShuttle || undefined,
          benchPress: prospectData.benchPress || undefined,
          drafted: prospectData.drafted,
          draftYear: prospectData.draftYear || undefined,
          teamId: prospectData.teamId || undefined,
          draftPickId: prospectData.draftPickId || undefined,
          createdAt: prospectData.createdAt || undefined,
          updatedAt: prospectData.updatedAt || undefined,
        });

        if (prospectResult.isSuccess) {
          prospects.push(prospectResult.getValue());
        }
      }

      return Result.ok<Prospect[]>(prospects);
    } catch (error) {
      console.error(`Error in findAll: ${(error as Error).message}`);
      return Result.fail<Prospect[]>(`Failed to fetch prospects: ${(error as Error).message}`);
    }
  }

  /**
   * Find prospects by filters
   */
  async findByFilters(
    filters: Partial<{
      position: string;
      college: string;
      drafted: boolean;
      draftYear: number;
      teamId: number;
    }>,
  ): Promise<Result<Prospect[]>> {
    try {
      const where: any = {};

      if (filters.position) {
        where.position = filters.position;
      }

      if (filters.college) {
        where.college = filters.college;
      }

      if (filters.drafted !== undefined) {
        where.drafted = filters.drafted;
      }

      if (filters.draftYear) {
        where.draftYear = filters.draftYear;
      }

      if (filters.teamId) {
        where.teamId = filters.teamId;
      }

      const prospectsData = await this.prisma.prospect.findMany({
        where,
        orderBy: {
          lastName: 'asc',
        },
      });

      const prospects: Prospect[] = [];

      for (const prospectData of prospectsData) {
        const prospectResult = Prospect.create({
          id: prospectData.id,
          firstName: prospectData.firstName,
          lastName: prospectData.lastName,
          position: prospectData.position,
          college: prospectData.college,
          height: prospectData.height,
          weight: prospectData.weight,
          handSize: prospectData.handSize || undefined,
          armLength: prospectData.armLength || undefined,
          homeCity: prospectData.homeCity || undefined,
          homeState: prospectData.homeState || undefined,
          fortyTime: prospectData.fortyTime || undefined,
          tenYardSplit: prospectData.tenYardSplit || undefined,
          verticalLeap: prospectData.verticalLeap || undefined,
          broadJump: prospectData.broadJump || undefined,
          threeCone: prospectData.threeCone || undefined,
          twentyYardShuttle: prospectData.twentyYardShuttle || undefined,
          benchPress: prospectData.benchPress || undefined,
          drafted: prospectData.drafted,
          draftYear: prospectData.draftYear || undefined,
          teamId: prospectData.teamId || undefined,
          draftPickId: prospectData.draftPickId || undefined,
          createdAt: prospectData.createdAt || undefined,
          updatedAt: prospectData.updatedAt || undefined,
        });

        if (prospectResult.isSuccess) {
          prospects.push(prospectResult.getValue());
        }
      }

      return Result.ok<Prospect[]>(prospects);
    } catch (error) {
      console.error(`Error in findByFilters: ${(error as Error).message}`);
      return Result.fail<Prospect[]>(
        `Failed to fetch prospects by filters: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a new prospect
   */
  async create(prospect: Prospect): Promise<Result<Prospect>> {
    try {
      const prospectData = prospect.toObject();

      // Remove id if it exists to let the database generate it
      if (prospectData.id !== undefined) {
        delete (prospectData as any).id;
      }

      // Set default timestamps if not present
      if (!prospectData.createdAt) {
        prospectData.createdAt = new Date();
      }

      if (!prospectData.updatedAt) {
        prospectData.updatedAt = new Date();
      }

      const createdProspect = await this.prisma.prospect.create({
        data: prospectData,
      });

      const prospectResult = Prospect.create({
        id: createdProspect.id,
        firstName: createdProspect.firstName,
        lastName: createdProspect.lastName,
        position: createdProspect.position,
        college: createdProspect.college,
        height: createdProspect.height,
        weight: createdProspect.weight,
        handSize: createdProspect.handSize || undefined,
        armLength: createdProspect.armLength || undefined,
        homeCity: createdProspect.homeCity || undefined,
        homeState: createdProspect.homeState || undefined,
        fortyTime: createdProspect.fortyTime || undefined,
        tenYardSplit: createdProspect.tenYardSplit || undefined,
        verticalLeap: createdProspect.verticalLeap || undefined,
        broadJump: createdProspect.broadJump || undefined,
        threeCone: createdProspect.threeCone || undefined,
        twentyYardShuttle: createdProspect.twentyYardShuttle || undefined,
        benchPress: createdProspect.benchPress || undefined,
        drafted: createdProspect.drafted,
        draftYear: createdProspect.draftYear || undefined,
        teamId: createdProspect.teamId || undefined,
        draftPickId: createdProspect.draftPickId || undefined,
        createdAt: createdProspect.createdAt || undefined,
        updatedAt: createdProspect.updatedAt || undefined,
      });

      if (prospectResult.isFailure) {
        return Result.fail<Prospect>(prospectResult.error as string);
      }

      return Result.ok<Prospect>(prospectResult.getValue());
    } catch (error) {
      console.error(`Error in create: ${(error as Error).message}`);
      return Result.fail<Prospect>(`Failed to create prospect: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing prospect
   */
  async update(id: number, prospect: Prospect): Promise<Result<Prospect>> {
    try {
      const prospectData = prospect.toObject();

      // Ensure the correct ID is used
      delete (prospectData as any).id;

      // Always update the updatedAt timestamp
      prospectData.updatedAt = new Date();

      const updatedProspect = await this.prisma.prospect.update({
        where: { id },
        data: prospectData,
      });

      const prospectResult = Prospect.create({
        id: updatedProspect.id,
        firstName: updatedProspect.firstName,
        lastName: updatedProspect.lastName,
        position: updatedProspect.position,
        college: updatedProspect.college,
        height: updatedProspect.height,
        weight: updatedProspect.weight,
        handSize: updatedProspect.handSize || undefined,
        armLength: updatedProspect.armLength || undefined,
        homeCity: updatedProspect.homeCity || undefined,
        homeState: updatedProspect.homeState || undefined,
        fortyTime: updatedProspect.fortyTime || undefined,
        tenYardSplit: updatedProspect.tenYardSplit || undefined,
        verticalLeap: updatedProspect.verticalLeap || undefined,
        broadJump: updatedProspect.broadJump || undefined,
        threeCone: updatedProspect.threeCone || undefined,
        twentyYardShuttle: updatedProspect.twentyYardShuttle || undefined,
        benchPress: updatedProspect.benchPress || undefined,
        drafted: updatedProspect.drafted,
        draftYear: updatedProspect.draftYear || undefined,
        teamId: updatedProspect.teamId || undefined,
        draftPickId: updatedProspect.draftPickId || undefined,
        createdAt: updatedProspect.createdAt || undefined,
        updatedAt: updatedProspect.updatedAt || undefined,
      });

      if (prospectResult.isFailure) {
        return Result.fail<Prospect>(prospectResult.error as string);
      }

      return Result.ok<Prospect>(prospectResult.getValue());
    } catch (error) {
      console.error(`Error in update: ${(error as Error).message}`);
      return Result.fail<Prospect>(`Failed to update prospect: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a prospect
   */
  async delete(id: number): Promise<Result<boolean>> {
    try {
      await this.prisma.prospect.delete({
        where: { id },
      });

      return Result.ok<boolean>(true);
    } catch (error) {
      console.error(`Error in delete: ${(error as Error).message}`);
      return Result.fail<boolean>(`Failed to delete prospect: ${(error as Error).message}`);
    }
  }

  /**
   * Find prospects by position
   */
  async findByPosition(position: string): Promise<Result<Prospect[]>> {
    return this.findByFilters({ position });
  }

  /**
   * Find prospects by college
   */
  async findByCollege(college: string): Promise<Result<Prospect[]>> {
    return this.findByFilters({ college });
  }

  /**
   * Find drafted prospects by team
   */
  async findByTeam(teamId: number): Promise<Result<Prospect[]>> {
    return this.findByFilters({ teamId, drafted: true });
  }

  /**
   * Find prospects by draft year
   */
  async findByDraftYear(draftYear: number): Promise<Result<Prospect[]>> {
    return this.findByFilters({ draftYear, drafted: true });
  }

  /**
   * Find undrafted prospects
   */
  async findUndrafted(): Promise<Result<Prospect[]>> {
    return this.findByFilters({ drafted: false });
  }

  /**
   * Find a prospect by draft pick
   */
  async findByDraftPick(draftPickId: number): Promise<Result<Prospect | null>> {
    try {
      const prospectData = await this.prisma.prospect.findFirst({
        where: {
          draftPickId,
          drafted: true,
        },
      });

      if (!prospectData) {
        return Result.ok<Prospect | null>(null);
      }

      const prospectResult = Prospect.create({
        id: prospectData.id,
        firstName: prospectData.firstName,
        lastName: prospectData.lastName,
        position: prospectData.position,
        college: prospectData.college,
        height: prospectData.height,
        weight: prospectData.weight,
        handSize: prospectData.handSize || undefined,
        armLength: prospectData.armLength || undefined,
        homeCity: prospectData.homeCity || undefined,
        homeState: prospectData.homeState || undefined,
        fortyTime: prospectData.fortyTime || undefined,
        tenYardSplit: prospectData.tenYardSplit || undefined,
        verticalLeap: prospectData.verticalLeap || undefined,
        broadJump: prospectData.broadJump || undefined,
        threeCone: prospectData.threeCone || undefined,
        twentyYardShuttle: prospectData.twentyYardShuttle || undefined,
        benchPress: prospectData.benchPress || undefined,
        drafted: prospectData.drafted,
        draftYear: prospectData.draftYear || undefined,
        teamId: prospectData.teamId || undefined,
        draftPickId: prospectData.draftPickId || undefined,
        createdAt: prospectData.createdAt || undefined,
        updatedAt: prospectData.updatedAt || undefined,
      });

      if (prospectResult.isFailure) {
        return Result.fail<Prospect | null>(prospectResult.error as string);
      }

      return Result.ok<Prospect | null>(prospectResult.getValue());
    } catch (error) {
      console.error(`Error in findByDraftPick: ${(error as Error).message}`);
      return Result.fail<Prospect | null>(
        `Failed to fetch prospect by draft pick: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Search prospects by name
   */
  async searchByName(name: string): Promise<Result<Prospect[]>> {
    try {
      // Create a search pattern for name
      const namePattern = name.trim().replace(/\s+/g, ' ').toLowerCase();

      const prospectsData = await this.prisma.prospect.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: namePattern,
              },
            },
            {
              lastName: {
                contains: namePattern,
              },
            },
          ],
        },
        orderBy: {
          lastName: 'asc',
        },
      });

      const prospects: Prospect[] = [];

      for (const prospectData of prospectsData) {
        const prospectResult = Prospect.create({
          id: prospectData.id,
          firstName: prospectData.firstName,
          lastName: prospectData.lastName,
          position: prospectData.position,
          college: prospectData.college,
          height: prospectData.height,
          weight: prospectData.weight,
          handSize: prospectData.handSize || undefined,
          armLength: prospectData.armLength || undefined,
          homeCity: prospectData.homeCity || undefined,
          homeState: prospectData.homeState || undefined,
          fortyTime: prospectData.fortyTime || undefined,
          tenYardSplit: prospectData.tenYardSplit || undefined,
          verticalLeap: prospectData.verticalLeap || undefined,
          broadJump: prospectData.broadJump || undefined,
          threeCone: prospectData.threeCone || undefined,
          twentyYardShuttle: prospectData.twentyYardShuttle || undefined,
          benchPress: prospectData.benchPress || undefined,
          drafted: prospectData.drafted,
          draftYear: prospectData.draftYear || undefined,
          teamId: prospectData.teamId || undefined,
          draftPickId: prospectData.draftPickId || undefined,
          createdAt: prospectData.createdAt || undefined,
          updatedAt: prospectData.updatedAt || undefined,
        });

        if (prospectResult.isSuccess) {
          prospects.push(prospectResult.getValue());
        }
      }

      return Result.ok<Prospect[]>(prospects);
    } catch (error) {
      console.error(`Error in searchByName: ${(error as Error).message}`);
      return Result.fail<Prospect[]>(
        `Failed to search prospects by name: ${(error as Error).message}`,
      );
    }
  }
}
