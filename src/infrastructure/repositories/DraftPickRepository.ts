
// src/infrastructure/repositories/DraftPickRepository.ts

import { DraftPick } from '@/domain/draft/entity/DraftPick'
import { PrismaClient } from '@prisma/client'
 
export class DraftPickRepository {
  constructor(private prisma: PrismaClient) {}

  async findByDraftYear(year: number): Promise<any[]> {
    // Get picks with team and prospect data using manual joins
    const picks = await this.prisma.$queryRaw`
      SELECT 
        dp.*,
        t.name as teamName,
        t.city as teamCity,
        t.conference as teamConference,
        t.division as teamDivision,
        p.firstName as prospectFirstName,
        p.lastName as prospectLastName,
        p.position as prospectPosition,
        p.college as prospectCollege
      FROM DraftPick dp
      LEFT JOIN Team t ON dp.currentTeamId = t.id
      LEFT JOIN Prospect p ON dp.prospectId = p.id
      WHERE dp.draftYear = ${year}
      ORDER BY dp.pickNumber ASC
    `

    return picks as any[]
  }

  async findById(id: number): Promise<DraftPick> {
    const pick = await this.prisma.draftPick.findUnique({
      where: { id }
    })

    if (!pick) {
      throw new Error(`Draft pick with id ${id} not found`)
    }

    return DraftPick.fromDatabase(pick)
  }

  async updatePick(id: number, data: { prospectId?: number; used?: boolean }): Promise<void> {
    await this.prisma.draftPick.update({
      where: { id },
      data: {
        ...(data.prospectId !== undefined && { prospectId: data.prospectId }),
        ...(data.used !== undefined && { used: data.used }),
        updatedAt: new Date()
      }
    })
  }

  async getTeamForPick(pickId: number) {
    const result = await this.prisma.$queryRaw`
      SELECT t.*
      FROM DraftPick dp
      JOIN Team t ON dp.currentTeamId = t.id
      WHERE dp.id = ${pickId}
    ` as any[]

    return result[0] || null
  }

  async create(draftPick: Omit<DraftPick, 'id'>): Promise<DraftPick> {
    const created = await this.prisma.draftPick.create({
      data: {
        round: draftPick.round,
        pickNumber: draftPick.pickNumber,
        draftYear: draftPick.draftYear,
        currentTeamId: draftPick.currentTeamId,
        originalTeam: draftPick.originalTeam || null,
        prospectId: draftPick.prospectId || null,
        playerId: draftPick.playerId || null,
        used: draftPick.used || false
      }
    })

    return DraftPick.fromDatabase(created)
  }
}