// src/modules/dradtOrder/infrastructure/persistence/prisma/PrismaDraftOrderSnapshotRepository
import type { PrismaClient } from '@prisma/client'
import type {
  DraftOrderSnapshotRepository,
  ListDraftOrderSnapshotsParams,
  DraftOrderSnapshotListItem,
  DraftOrderSnapshotDetail,
  DraftOrderEntryDetail,
  DraftOrderTiebreakAuditRow,
} from '../../../domain/repositories/DraftOrderSnapshotRepository'

type PrismaMode = 'current' | 'projection'

export class PrismaDraftOrderSnapshotRepository implements DraftOrderSnapshotRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listSnapshots(
    params: ListDraftOrderSnapshotsParams
  ): Promise<{ readonly items: readonly DraftOrderSnapshotListItem[]; readonly total: number }> {
    const skip: number = (params.page - 1) * params.pageSize
    const take: number = params.pageSize

    const where: {
      mode?: PrismaMode
      strategy?: string | null
      seasonYear?: string
      seasonType?: number
      throughWeek?: number | null
    } = {}

    if (params.mode) where.mode = params.mode
    if (typeof params.strategy === 'string') where.strategy = params.strategy
    if (typeof params.seasonYear === 'string') where.seasonYear = params.seasonYear
    if (typeof params.seasonType === 'number') where.seasonType = params.seasonType
    if (typeof params.throughWeek === 'number') where.throughWeek = params.throughWeek

    const [total, rows] = await Promise.all([
      this.prisma.draftOrderSnapshot.count({ where }),
      this.prisma.draftOrderSnapshot.findMany({
        where,
        orderBy: { computedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          mode: true,
          strategy: true,
          seasonYear: true,
          seasonType: true,
          throughWeek: true,
          source: true,
          inputHash: true,
          computedAt: true,
          jobId: true,
          _count: { select: { entries: true } },
        },
      }),
    ])

    const items: DraftOrderSnapshotListItem[] = rows.map((r) => ({
      id: r.id,
      mode: r.mode,
      strategy: r.strategy,
      seasonYear: r.seasonYear,
      seasonType: r.seasonType,
      throughWeek: r.throughWeek,
      source: r.source,
      inputHash: r.inputHash,
      computedAt: r.computedAt,
      jobId: r.jobId,
      entryCount: r._count.entries,
    }))

    return { items, total }
  }

  async getSnapshotById(id: number): Promise<DraftOrderSnapshotDetail | null> {
    const row = await this.prisma.draftOrderSnapshot.findUnique({
      where: { id },
      select: {
        id: true,
        mode: true,
        strategy: true,
        seasonYear: true,
        seasonType: true,
        throughWeek: true,
        source: true,
        inputHash: true,
        computedAt: true,
        jobId: true,
        entries: {
          orderBy: { draftSlot: 'asc' },
          select: {
            id: true,
            draftSlot: true,
            isPlayoff: true,
            isProjected: true,
            wins: true,
            losses: true,
            ties: true,
            winPct: true,
            sos: true,
            pointsFor: true,
            pointsAgainst: true,
            Team: { select: { id: true, name: true, abbreviation: true } },
            audits: {
              orderBy: { stepNbr: 'asc' },
              select: {
                id: true,
                stepNbr: true,
                ruleCode: true,
                resultCode: true,
                resultSummary: true,
                detailsJson: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    if (!row) return null

    const entries: DraftOrderEntryDetail[] = row.entries.map((e): DraftOrderEntryDetail => {
      const audits: DraftOrderTiebreakAuditRow[] = e.audits.map(
        (a): DraftOrderTiebreakAuditRow => ({
          id: a.id,
          stepNbr: a.stepNbr,
          ruleCode: a.ruleCode,
          resultCode: a.resultCode,
          resultSummary: a.resultSummary,
          detailsJson: a.detailsJson,
          createdAt: a.createdAt,
        })
      )

      return {
        id: e.id,
        draftSlot: e.draftSlot,
        isPlayoff: e.isPlayoff,
        isProjected: e.isProjected,
        wins: e.wins,
        losses: e.losses,
        ties: e.ties,
        winPct: e.winPct.toString(),
        sos: e.sos.toString(),
        pointsFor: e.pointsFor,
        pointsAgainst: e.pointsAgainst,
        team: { id: e.Team.id, name: e.Team.name, abbreviation: e.Team.abbreviation },
        audits,
      }
    })

    return {
      id: row.id,
      mode: row.mode,
      strategy: row.strategy,
      seasonYear: row.seasonYear,
      seasonType: row.seasonType,
      throughWeek: row.throughWeek,
      source: row.source,
      inputHash: row.inputHash,
      computedAt: row.computedAt,
      jobId: row.jobId,
      entries,
    }
  }
}
