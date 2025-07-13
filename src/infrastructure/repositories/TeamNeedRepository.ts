// src/infrastructure/repositories/TeamNeedRepository.ts
 
import { PrismaClient } from '@prisma/client'
import { TeamNeed } from '../../domain/team/entity/TeamNeed'

export class TeamNeedRepository {
  constructor(private prisma: PrismaClient) {}

  async findByTeamId(teamId: number, draftYear?: number): Promise<TeamNeed[]> {
    const needs = await this.prisma.teamNeed.findMany({
      where: {
        teamId,
        ...(draftYear && { draftYear })
      },
      orderBy: { priority: 'asc' }
    })

    return needs.map(need => TeamNeed.fromDatabase(need))
  }

  async create(teamNeed: Omit<TeamNeed, 'id'>): Promise<TeamNeed> {
    const created = await this.prisma.teamNeed.create({
      data: {
        teamId: teamNeed.teamId,
        position: teamNeed.position,
        priority: teamNeed.priority,
        draftYear: teamNeed.draftYear
      }
    })

    return TeamNeed.fromDatabase(created)
  }

  async update(id: number, data: Partial<TeamNeed>): Promise<void> {
    await this.prisma.teamNeed.update({
      where: { id },
      data: {
        priority: data.priority,
        updatedAt: new Date()
      }
    })
  }

  async delete(id: number): Promise<void> {
    await this.prisma.teamNeed.delete({
      where: { id }
    })
  }
}