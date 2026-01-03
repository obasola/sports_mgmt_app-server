import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient, Prisma } from '@prisma/client'
import { createHash } from 'crypto'

import { PrismaDraftOrderSnapshotRepository } from '@/modules/draftOrder/infrastructure/persistence/prisma/PrismaDraftOrderSnapshotRepository'
import type { CreateDraftOrderSnapshotRequest } from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex')

const uniq = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

// Prisma JSON helper: store NULL when null is provided, otherwise store JSON
const toJsonInput = (
  v: unknown | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (v === undefined) return undefined
  if (v === null) return Prisma.DbNull
  return v as Prisma.InputJsonValue
}

describe('DraftOrderSnapshot persistence (integration)', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates snapshot w/ entries+audits, prints assignments, and deletes with cascade', async () => {
    const repo = new PrismaDraftOrderSnapshotRepository(prisma)

    const suffix = uniq()

    const teamA = await prisma.team.create({
      data: {
        name: `TEST DraftOrder Team A ${suffix}`,
        abbreviation: `TA${suffix.slice(0, 2).toUpperCase()}`,
        city: 'TestCity',
        state: 'TS',
        conference: 'AFC',
        division: 'WEST',
        stadium: 'Test Stadium',
      },
      select: { id: true, name: true, abbreviation: true },
    })

    const teamB = await prisma.team.create({
      data: {
        name: `TEST DraftOrder Team B ${suffix}`,
        abbreviation: `TB${suffix.slice(0, 2).toUpperCase()}`,
        city: 'TestCity',
        state: 'TS',
        conference: 'NFC',
        division: 'EAST',
        stadium: 'Test Stadium',
      },
      select: { id: true, name: true, abbreviation: true },
    })

    const planned = [
      { draftSlot: 1, teamId: teamA.id, teamName: teamA.name },
      { draftSlot: 2, teamId: teamB.id, teamName: teamB.name },
    ]
    // eslint-disable-next-line no-console
    console.log('\n[DraftOrder TEST] Planned assignments:', planned)

    const inputHash = sha256(
      JSON.stringify({
        mode: 'current',
        seasonYear: '2025',
        seasonType: 2,
        throughWeek: 10,
        teams: planned.map((p) => p.teamId),
      })
    )

    const req: CreateDraftOrderSnapshotRequest = {
      mode: 'current',
      strategy: null,
      seasonYear: '2025',
      seasonType: 2,
      throughWeek: 10,
      source: 'test',
      inputHash,
      computedAt: new Date(),
      entries: [
        {
          teamId: teamA.id,
          draftSlot: 1,
          isPlayoff: false,
          isProjected: false,
          wins: 2,
          losses: 8,
          ties: 0,
          winPct: '0.20000',
          sos: '0.50000',
          pointsFor: 150,
          pointsAgainst: 260,
          audits: [
            {
              stepNbr: 1,
              ruleCode: 'BASE_RECORD',
              resultCode: 'OK',
              resultSummary: 'Assigned by record',
              detailsJson: { note: 'test-audit-a' } as unknown as Prisma.JsonValue,
            },
          ],
        },
        {
          teamId: teamB.id,
          draftSlot: 2,
          isPlayoff: false,
          isProjected: false,
          wins: 3,
          losses: 7,
          ties: 0,
          winPct: '0.30000',
          sos: '0.48000',
          pointsFor: 170,
          pointsAgainst: 240,
          audits: [
            {
              stepNbr: 1,
              ruleCode: 'BASE_RECORD',
              resultCode: 'OK',
              resultSummary: 'Assigned by record',
              detailsJson: { note: 'test-audit-b' } as unknown as Prisma.JsonValue,
            },
          ],
        },
      ],
    }

    // Persist via your repository
    const created = await repo.createSnapshot(req)

    // eslint-disable-next-line no-console
    console.log('[DraftOrder TEST] Persisted snapshot id:', created.id)

    const persistedAssignments = created.entries.map((e) => ({
      draftSlot: e.draftSlot,
      teamId: e.team.id,
      teamName: e.team.name,
      audits: e.audits.length,
    }))
    // eslint-disable-next-line no-console
    console.log('[DraftOrder TEST] Persisted assignments:', persistedAssignments)

    // Read-back asserts
    const readBack = await repo.getById(created.id)
    expect(readBack).not.toBeNull()
    expect(readBack?.entries).toHaveLength(2)
    expect(readBack?.entries[0]?.draftSlot).toBe(1)
    expect(readBack?.entries[0]?.team.id).toBe(teamA.id)

    const entryCountBeforeDelete = await prisma.draftOrderEntry.count({
      where: { snapshotId: created.id },
    })
    expect(entryCountBeforeDelete).toBe(2)

    const auditCountBeforeDelete = await prisma.draftOrderTiebreakAudit.count({
      where: { DraftOrderEntry: { snapshotId: created.id } },
    })
    expect(auditCountBeforeDelete).toBeGreaterThan(0)

    // Delete snapshot (should cascade to entries/audits)
    await prisma.draftOrderSnapshot.delete({ where: { id: created.id } })

    const entryCountAfterDelete = await prisma.draftOrderEntry.count({
      where: { snapshotId: created.id },
    })
    expect(entryCountAfterDelete).toBe(0)

    const auditCountAfterDelete = await prisma.draftOrderTiebreakAudit.count({
      where: { DraftOrderEntry: { snapshotId: created.id } },
    })
    expect(auditCountAfterDelete).toBe(0)

    // Cleanup teams
    await prisma.team.delete({ where: { id: teamA.id } })
    await prisma.team.delete({ where: { id: teamB.id } })
  })
})
