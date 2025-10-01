import { prisma } from '../../lib/prisma'
import { EspnTeamSchema } from '../schemas/teams'

export async function upsertEspnTeams(data: unknown) {
  const parsed = EspnTeamSchema.parse(data)
  const teams = parsed.sports.flatMap(s => s.leagues.flatMap(l => l.teams.map(t => t.team)))
  for (const t of teams) {
    await prisma.espn_teams.upsert({
      where: { espn_id: t.id },
      update: {
        name: t.name,
        display_name: t.displayName,
        abbreviation: t.abbreviation,
        city: t.location ?? undefined,
        color: t.color ?? null,
        alternate_color: t.alternateColor ?? null,
        logo_url: t.logos?.[0]?.href ?? null,
        is_active: true,
        last_sync_at: new Date()
      },
      create: {
        espn_id: t.id,
        name: t.name,
        display_name: t.displayName,
        abbreviation: t.abbreviation,
        city: t.location ?? '',
        is_active: true,
        logo_url: t.logos?.[0]?.href ?? null
      }
    })
  }
  return teams.length
}