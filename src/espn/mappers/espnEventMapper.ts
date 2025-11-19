// src/espn/mappers/espnEventMapper.ts

import { ITeamRepository } from '../../domain/team/repositories/ITeamRepository'
import { z } from 'zod'

// ESPN CORE EVENT SCHEMA (minimal for our purposes)
const competitorSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  team: z.object({
    id: z.string().optional(),
    uid: z.string().optional(),
    slug: z.string().optional(),
    href: z.string().optional(),
  }).optional(),
})

const competitionSchema = z.object({
  id: z.string(),
  competitors: z.array(competitorSchema),
  date: z.string().optional(), // kickoff timestamp
})

const eventSchema = z.object({
  id: z.string(),
  uid: z.string().optional(),
  name: z.string().optional(),
  date: z.string().optional(),
  competitions: z.array(competitionSchema),
})

export type NormalizedEventGame = {
  espnEventId: string
  espnCompetitionId: string
  seasonYear: number
  seasonType: number
  week: number
  homeTeamId: number
  awayTeamId: number
  gameDate: Date
}

export async function mapEspnEventToGame(
  rawEvent: any,
  seasonYear: number,
  seasonType: number,
  week: number,
  teamRepo: ITeamRepository
): Promise<NormalizedEventGame | null> {
  const parsed = eventSchema.safeParse(rawEvent)
  if (!parsed.success) return null
  const evt = parsed.data

  if (!evt.competitions.length) return null
  const comp = evt.competitions[0]

  const compId = comp.id
  const kickoff = comp.date ?? evt.date
  if (!kickoff) return null
  const gameDate = new Date(kickoff)

  // Extract team IDs from CORE team href:
  // https://sports.core.api.espn.com/.../teams/12
  const competitors = comp.competitors
  if (competitors.length !== 2) return null

  const extractTeamId = (href?: string) => {
    if (!href) return null
    const parts = href.split('/')
    const id = parts[parts.length - 1]
    return /^\d+$/.test(id) ? Number(id) : null
  }

  // Identify home/away based on ESPN competitor.order or type
  // ESPN often marks home with order = "1"
  let homeEspnId: number | null = null
  let awayEspnId: number | null = null

  const cA = competitors[0]
  const cB = competitors[1]

  const idA = extractTeamId(cA.team?.href)
  const idB = extractTeamId(cB.team?.href)
  if (!idA || !idB) return null

  // ESPN uses "home" in competitor.type for CORE
  if (cA.type === "home") {
    homeEspnId = idA
    awayEspnId = idB
  } else if (cB.type === "home") {
    homeEspnId = idB
    awayEspnId = idA
  } else {
    // fallback: first = away, second = home (common in CORE)
    homeEspnId = idB
    awayEspnId = idA
  }

  const homeTeam = await teamRepo.findByEspnTeamId(homeEspnId)
  const awayTeam = await teamRepo.findByEspnTeamId(awayEspnId)
  if (!homeTeam || !awayTeam) return null
  if (!homeTeam.id || !awayTeam.id) {
  throw new Error(`Mapper error: missing team ids (home=${homeTeam.id}, away=${awayTeam.id})`);
}
  return {
    espnEventId: evt.id,
    espnCompetitionId: compId,
    seasonYear,
    seasonType,
    week,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    gameDate,
  }
}
