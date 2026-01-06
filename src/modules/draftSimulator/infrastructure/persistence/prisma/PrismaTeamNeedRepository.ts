import type { PrismaClient } from '@prisma/client'
import type { TeamNeedRepository, TeamNeedWeight, TeamNeedPriority } from '../../../domain/repositories/TeamNeedRepository'

export class PrismaTeamNeedRepository implements TeamNeedRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async getTeamNeedWeights(teamId: number, draftYear: number): Promise<TeamNeedWeight[]> {
    const rows = await this.prisma.teamNeed.findMany({
      where: { teamId, OR: [{ draftYear }, { draftYear: null }] }
    })

    return rows.map((r) => {
      const pr = Math.max(1, Math.min(5, r.priority))
      const weight = 6 - pr
      return { position: r.position, weight }
    })
  }

  public async listTopNeeds(teamId: number, draftYear: number, limit: number): Promise<TeamNeedPriority[]> {
    const take = Math.max(1, Math.min(limit, 10))

    // Prefer year-specific rows if present; else fallback to null-year rows.
    // We'll do that by ordering year-specific first.
    const rows = await this.prisma.teamNeed.findMany({
      where: { teamId, OR: [{ draftYear }, { draftYear: null }] },
      orderBy: [
        // year-specific first
        { draftYear: 'desc' },
        // higher need first (priority 1 is best)
        { priority: 'asc' }
      ],
      take
    })

    return rows.map((r) => ({
      position: r.position,
      priority: r.priority
    }))
  }
}
