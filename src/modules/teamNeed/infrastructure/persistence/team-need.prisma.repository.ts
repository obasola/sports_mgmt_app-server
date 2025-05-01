// src/modules/teamNeed/infrastructure/persistence/team-need.prisma.repository.ts
import { PrismaClient } from '@prisma/client';
import { TeamNeed } from '../../domain/team-need.entity';
import { TeamNeedRepository } from '../../domain/team-need.repository';

export class TeamNeedPrismaRepository implements TeamNeedRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<TeamNeed[]> {
    const teamNeeds = await this.prisma.teamNeed.findMany();
    return teamNeeds.map(this.toDomain);
  }

  async findById(id: number): Promise<TeamNeed | null> {
    const teamNeed = await this.prisma.teamNeed.findUnique({
      where: { id },
    });
    return teamNeed ? this.toDomain(teamNeed) : null;
  }

  async findByTeamId(teamId: number): Promise<TeamNeed[]> {
    const teamNeeds = await this.prisma.teamNeed.findMany({
      where: { teamId },
    });
    return teamNeeds.map(this.toDomain);
  }

  async findByPosition(position: string): Promise<TeamNeed[]> {
    const teamNeeds = await this.prisma.teamNeed.findMany({
      where: { position },
    });
    return teamNeeds.map(this.toDomain);
  }

  async findByPriority(priority: number): Promise<TeamNeed[]> {
    const teamNeeds = await this.prisma.teamNeed.findMany({
      where: { priority },
    });
    return teamNeeds.map(this.toDomain);
  }

  async findByDraftYear(draftYear: Date): Promise<TeamNeed[]> {
    const teamNeeds = await this.prisma.teamNeed.findMany({
      where: { draftYear },
    });
    return teamNeeds.map(this.toDomain);
  }

  async findByTeamAndPosition(teamId: number, position: string): Promise<TeamNeed | null> {
    const teamNeed = await this.prisma.teamNeed.findFirst({
      where: {
        teamId,
        position,
      },
    });
    return teamNeed ? this.toDomain(teamNeed) : null;
  }

  async save(teamNeed: TeamNeed): Promise<TeamNeed> {
    if (teamNeed.id === 0) {
      // Create new
      const created = await this.prisma.teamNeed.create({
        data: {
          teamId: teamNeed.teamId,
          position: teamNeed.position,
          priority: teamNeed.priority,
          createdAt: teamNeed.createdAt,
          updatedAt: teamNeed.updatedAt,
          draftYear: teamNeed.draftYear,
        },
      });
      return this.toDomain(created);
    } else {
      // Update existing
      const updated = await this.prisma.teamNeed.update({
        where: { id: teamNeed.id },
        data: {
          teamId: teamNeed.teamId,
          position: teamNeed.position,
          priority: teamNeed.priority,
          updatedAt: teamNeed.updatedAt,
          draftYear: teamNeed.draftYear,
        },
      });
      return this.toDomain(updated);
    }
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.teamNeed.delete({
      where: { id },
    });
    return true;
  }

  private toDomain(prismaTeamNeed: any): TeamNeed {
    return new TeamNeed(
      prismaTeamNeed.id,
      prismaTeamNeed.teamId,
      prismaTeamNeed.position,
      prismaTeamNeed.priority,
      prismaTeamNeed.createdAt,
      prismaTeamNeed.updatedAt,
      prismaTeamNeed.draftYear,
    );
  }
}
