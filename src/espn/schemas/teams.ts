import { z } from 'zod'

// ESPN teams payload (simplified; adjust as you learn the shape)
export const EspnTeamSchema = z.object({
  sports: z.array(z.object({
    leagues: z.array(z.object({
      teams: z.array(z.object({ team: z.object({
        id: z.string(),
        displayName: z.string(),
        name: z.string(),
        abbreviation: z.string(),
        color: z.string().optional(),
        alternateColor: z.string().optional(),
        location: z.string().optional(),
        logos: z.array(z.object({ href: z.string() })).optional()
      }) }))
    }))
  }))
})

export type EspnTeamPayload = z.infer<typeof EspnTeamSchema>