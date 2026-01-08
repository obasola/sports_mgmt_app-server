import { PrismaClient } from '@prisma/client'

export type TeamConference = 'AFC' | 'NFC'

export interface TeamMetaRow {
  teamId: number
  espnTeamId: number
  name: string
  abbreviation: string | null
  conference: TeamConference | null
}

const prisma = new PrismaClient()

export class PrismaTeamMetaRepository {
  async findAllMeta(): Promise<TeamMetaRow[]> {
    const rows = await prisma.team.findMany({
      select: {
        id: true,
        espnTeamId: true,
        name: true,
        abbreviation: true,
        conference: true,
      },
    })

    return rows
      .filter((r): r is typeof rows[number] & { espnTeamId: number } => typeof r.espnTeamId === 'number')
      .map(r => ({
        teamId: r.id,
        espnTeamId: r.espnTeamId,
        name: r.name,
        abbreviation: r.abbreviation ?? null,
        conference: r.conference === 'AFC' || r.conference === 'NFC' ? r.conference : null,
      }))
  }
}
