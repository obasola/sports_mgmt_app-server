import { z } from 'zod'

export const EspnAthleteSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  displayName: z.string().optional(),
  shortName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  jersey: z.union([z.string(), z.number()]).optional(),
  position: z.object({ abbreviation: z.string().optional() }).optional(),
  team: z.object({ id: z.union([z.string(), z.number()]).optional() }).optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  age: z.number().optional(),
  dateOfBirth: z.string().optional(),
  birthDate: z.string().optional(),
  college: z.string().optional(),
  experience: z.union([z.number(), z.string()]).optional(),
  status: z.string().optional()
})

export const EspnRosterSchema = z.object({
  // ESPN sometimes gives { items: Athlete[] } or { athletes: [{ items: Athlete[] } ...] }
  items: z.array(EspnAthleteSchema).optional(),
  athletes: z.array(z.object({ items: z.array(EspnAthleteSchema).optional() })).optional()
})

export type EspnRosterPayload = z.infer<typeof EspnRosterSchema>