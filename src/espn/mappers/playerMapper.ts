import { espn_players } from './../../../node_modules/.prisma/client/index.d';
import { prisma } from '../../lib/prisma'
import { EspnRosterSchema } from '../schemas/players'

function mapPosition(p?: string | null): any {
  if (!p) return 'WR' as const
  const up = p.toUpperCase()
  const allowed = ['QB','RB','FB','WR','TE','OL','C','G','T','DL','DE','DT','NT','LB','MLB','OLB','DB','CB','S','FS','SS','K','P','LS'] as const
  return (allowed as readonly string[]).includes(up) ? up : 'WR'
}

export async function upsertEspnPlayers(raw: unknown) {
  const parsed = EspnRosterSchema.parse(raw)
  const athletes = parsed.items ?? parsed.athletes?.flatMap(b => b.items ?? []) ?? []
  let count = 0
  for (const a of athletes) {
    const espnId = String(a.id)
    const first_name = a.firstName ?? ''
    const last_name = a.lastName ?? ''
    const display_name = (a.displayName ?? [a.firstName, a.lastName].filter(Boolean).join(' ') ) || espnId 
    const short_name = a.shortName ?? display_name
    const position = mapPosition(a.position?.abbreviation)

    await prisma.espn_players.upsert({
      where: { espn_id: espnId },
      update: {
        first_name,
        last_name,
        display_name,
        short_name,
        position,
        jersey_number: a.jersey ? Number(a.jersey) : null,
        team_espn_id: a.team?.id ? String(a.team.id) : null,
        height: typeof a.height === 'number' ? a.height : null,
        weight: typeof a.weight === 'number' ? a.weight : null,
        age: typeof a.age === 'number' ? a.age : null,
        date_of_birth: (a.birthDate || a.dateOfBirth) ? new Date(a.birthDate || a.dateOfBirth as string) : null,
        college: a.college ?? null,
        experience: typeof a.experience === 'number' ? a.experience : null,
        is_active: true,
        last_sync_at: new Date()
      },
      create: {
        espn_id: espnId,
        first_name,
        last_name,
        display_name,
        short_name,
        position,
        jersey_number: a.jersey ? Number(a.jersey) : null,
        team_espn_id: a.team?.id ? String(a.team.id) : null,
        height: typeof a.height === 'number' ? a.height : null,
        weight: typeof a.weight === 'number' ? a.weight : null,
        age: typeof a.age === 'number' ? a.age : null,
        date_of_birth: (a.birthDate || a.dateOfBirth) ? new Date(a.birthDate || a.dateOfBirth as string) : null,
        college: a.college ?? null,
        experience: typeof a.experience === 'number' ? a.experience : null,
        is_active: true
      }
    })
    count++
  }
  return count
}