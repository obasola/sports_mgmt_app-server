// src/modules/draftOrder/infrastructure/persistence/prisma/PrismaDraftOrderSnapshotRepository.ts
import type { PrismaClient, Prisma } from '@prisma/client'
import { Prisma as PrismaNs } from '@prisma/client'

import type {
  DraftOrderSnapshotRepository,
  ListDraftOrderSnapshotsParams,
  DraftOrderSnapshotListItem,
  DraftOrderSnapshotDetail,
  DraftOrderEntryDetail,
  DraftOrderTiebreakAuditRow,
} from '../../../domain/repositories/DraftOrderSnapshotRepository'

import type {
  DraftOrderSnapshotDetailDto,
  DraftOrderTiebreakAuditDto,
} from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotDetailDto'
import type { DraftOrderSnapshotListItemDto } from '@/modules/draftOrder/application/dtos/DraftOrderSnapshotListItemDto'
import type { ListDraftOrderSnapshotsQueryDto } from '@/modules/draftOrder/application/dtos/ListDraftOrderSnapshotsQueryDto'
import type { PagedResultDto } from '@/modules/draftOrder/application/dtos/PagedResultDto'
import type { CreateDraftOrderSnapshotRequest } from '@/modules/draftOrder/domain/repositories/DraftOrderSnapshotRepository'

type PrismaMode = 'current' | 'projection'

const toJsonInput = (
  v: unknown | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (v === undefined) return undefined
  if (v === null) return PrismaNs.DbNull // store SQL NULL
  return v as Prisma.InputJsonValue
}

type SnapshotListRow = Prisma.DraftOrderSnapshotGetPayload<{
  select: {
    id: true
    mode: true
    strategy: true
    seasonYear: true
    seasonType: true
    throughWeek: true
    source: true
    inputHash: true
    computedAt: true
    jobId: true
  }
}>

type EntryRow = Prisma.DraftOrderEntryGetPayload<{
  select: {
    id: true
    teamId: true
    draftSlot: true
    isPlayoff: true
    isProjected: true
    wins: true
    losses: true
    ties: true
    winPct: true
    sos: true
    pointsFor: true
    pointsAgainst: true
    Team: { select: { id: true; name: true; abbreviation: true } }
  }
}>

type AuditRow = Prisma.DraftOrderTiebreakAuditGetPayload<{
  select: {
    id: true
    entryId: true
    stepNbr: true
    ruleCode: true
    resultCode: true
    resultSummary: true
    detailsJson: true
    createdAt: true
  }
}>

export class PrismaDraftOrderSnapshotRepository implements DraftOrderSnapshotRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listSnapshots(
    params: ListDraftOrderSnapshotsParams
  ): Promise<{ readonly items: readonly DraftOrderSnapshotListItem[]; readonly total: number }> {
    const skip: number = (params.page - 1) * params.pageSize
    const take: number = params.pageSize

    const where: Prisma.DraftOrderSnapshotWhereInput = {}

    if (params.mode) where.mode = params.mode as PrismaMode
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
        },
      }) as Promise<SnapshotListRow[]>,
    ])

    const snapshotIds: readonly number[] = rows.map((r) => r.id)

    const counts =
      snapshotIds.length === 0
        ? []
        : await this.prisma.draftOrderEntry.groupBy({
            by: ['snapshotId'],
            where: { snapshotId: { in: snapshotIds as number[] } },
            _count: { _all: true },
          })

    const countBySnapshotId = new Map<number, number>(counts.map((c) => [c.snapshotId, c._count._all]))

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
      entryCount: countBySnapshotId.get(r.id) ?? 0,
    }))

    return { items, total }
  }

  public async getSnapshotById(id: number): Promise<DraftOrderSnapshotDetail | null> {
    const snap = await this.prisma.draftOrderSnapshot.findUnique({
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
      },
    })

    if (!snap) return null

    // IMPORTANT: do NOT select relation fields Prisma doesn't recognize (like "audits").
    // Query entries and audits separately.
    const entryRows = (await this.prisma.draftOrderEntry.findMany({
      where: { snapshotId: id },
      orderBy: { draftSlot: 'asc' },
      select: {
        id: true,
        teamId: true,
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
      },
    })) as EntryRow[]

    const entryIds: number[] = entryRows.map((e) => e.id)

    const auditRows: AuditRow[] =
      entryIds.length === 0
        ? []
        : ((await this.prisma.draftOrderTiebreakAudit.findMany({
            where: { entryId: { in: entryIds } },
            orderBy: [{ entryId: 'asc' }, { stepNbr: 'asc' }],
            select: {
              id: true,
              entryId: true,
              stepNbr: true,
              ruleCode: true,
              resultCode: true,
              resultSummary: true,
              detailsJson: true,
              createdAt: true,
            },
          })) as AuditRow[])

    const auditsByEntryId = new Map<number, DraftOrderTiebreakAuditRow[]>()

    for (const a of auditRows) {
      const row: DraftOrderTiebreakAuditRow = {
        id: a.id,
        stepNbr: a.stepNbr,
        ruleCode: a.ruleCode,
        resultCode: a.resultCode,
        resultSummary: a.resultSummary,
        detailsJson: a.detailsJson as Prisma.JsonValue | null,
        createdAt: a.createdAt,
      }

      const bucket = auditsByEntryId.get(a.entryId)
      if (bucket) bucket.push(row)
      else auditsByEntryId.set(a.entryId, [row])
    }

    const entries: DraftOrderEntryDetail[] = entryRows.map((e) => ({
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
      audits: auditsByEntryId.get(e.id) ?? [],
    }))

    return {
      id: snap.id,
      mode: snap.mode,
      strategy: snap.strategy,
      seasonYear: snap.seasonYear,
      seasonType: snap.seasonType,
      throughWeek: snap.throughWeek,
      source: snap.source,
      inputHash: snap.inputHash,
      computedAt: snap.computedAt,
      jobId: snap.jobId,
      entries,
    }
  }

  public async listPaged(
    query: ListDraftOrderSnapshotsQueryDto
  ): Promise<PagedResultDto<DraftOrderSnapshotListItemDto>> {
    const { items, total } = await this.listSnapshots({
      mode: query.mode,
      strategy: query.strategy,
      seasonYear: query.seasonYear,
      seasonType: query.seasonType,
      throughWeek: query.throughWeek,
      page: query.page,
      pageSize: query.pageSize,
    })

    const dtoItems: DraftOrderSnapshotListItemDto[] = items.map((x) => ({
      id: x.id,
      mode: x.mode,
      strategy: x.strategy,
      seasonYear: x.seasonYear,
      seasonType: x.seasonType,
      throughWeek: x.throughWeek,
      source: x.source,
      inputHash: x.inputHash,
      computedAt: x.computedAt.toISOString(),
      jobId: x.jobId,
      entryCount: x.entryCount,
    }))

    return {
      items: dtoItems,
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  }

  public async getById(snapshotId: number): Promise<DraftOrderSnapshotDetailDto | null> {
    const snap = await this.getSnapshotById(snapshotId)
    if (!snap) return null

    return {
      id: snap.id,
      mode: snap.mode,
      strategy: snap.strategy,
      seasonYear: snap.seasonYear,
      seasonType: snap.seasonType,
      throughWeek: snap.throughWeek,
      source: snap.source,
      inputHash: snap.inputHash,
      computedAt: snap.computedAt.toISOString(),
      jobId: snap.jobId,
      entries: snap.entries.map((e) => ({
        id: e.id,
        teamId: e.team.id,
        draftSlot: e.draftSlot,
        isPlayoff: e.isPlayoff,
        isProjected: e.isProjected,
        wins: e.wins,
        losses: e.losses,
        ties: e.ties,
        winPct: e.winPct,
        sos: e.sos,
        pointsFor: e.pointsFor,
        pointsAgainst: e.pointsAgainst,
        team: {
          id: e.team.id,
          name: e.team.name,
          abbreviation: e.team.abbreviation,
        },
        audits: e.audits.map(
          (a): DraftOrderTiebreakAuditDto => ({
            id: a.id,
            stepNbr: a.stepNbr,
            ruleCode: a.ruleCode,
            resultCode: a.resultCode,
            resultSummary: a.resultSummary,
            detailsJson: a.detailsJson,
            createdAt: a.createdAt.toISOString(),
          })
        ),
      })),
    }
  }

  public async createSnapshot(req: CreateDraftOrderSnapshotRequest): Promise<DraftOrderSnapshotDetailDto> {
    return this.prisma.$transaction(async (tx): Promise<DraftOrderSnapshotDetailDto> => {
      // 1) create snapshot row ONLY (no nested entries)
      const snapshotRow = await tx.draftOrderSnapshot.create({
        data: {
          mode: req.mode,
          strategy: req.strategy,
          seasonYear: req.seasonYear,
          seasonType: req.seasonType,
          throughWeek: req.throughWeek,
          source: req.source,
          inputHash: req.inputHash,
          computedAt: req.computedAt,
        },
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
        },
      })

      // 2) create entries + audits
      const entryDtos = await Promise.all(
        req.entries.map(async (e) => {
          const entryRow = await tx.draftOrderEntry.create({
            data: {
              snapshotId: snapshotRow.id,
              teamId: e.teamId,
              draftSlot: e.draftSlot,
              isPlayoff: e.isPlayoff,
              isProjected: e.isProjected,
              wins: e.wins,
              losses: e.losses,
              ties: e.ties,
              winPct: new PrismaNs.Decimal(e.winPct),
              sos: new PrismaNs.Decimal(e.sos),
              pointsFor: e.pointsFor,
              pointsAgainst: e.pointsAgainst,
            },
            select: {
              id: true,
              teamId: true,
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
            },
          })

          if (e.audits.length > 0) {
            await tx.draftOrderTiebreakAudit.createMany({
              data: e.audits.map((a) => ({
                entryId: entryRow.id,
                stepNbr: a.stepNbr,
                ruleCode: a.ruleCode,
                resultCode: a.resultCode,
                resultSummary: a.resultSummary,
                detailsJson: toJsonInput(a.detailsJson),
              })),
            })
          }

          const auditsRows = await tx.draftOrderTiebreakAudit.findMany({
            where: { entryId: entryRow.id },
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
          })

          const audits: readonly DraftOrderTiebreakAuditDto[] = auditsRows.map(
            (a): DraftOrderTiebreakAuditDto => ({
              id: a.id,
              stepNbr: a.stepNbr,
              ruleCode: a.ruleCode,
              resultCode: a.resultCode,
              resultSummary: a.resultSummary,
              detailsJson: (a.detailsJson as Prisma.JsonValue | null) ?? null,
              createdAt: a.createdAt.toISOString(),
            })
          )

          return {
            id: entryRow.id,
            teamId: entryRow.teamId,
            draftSlot: entryRow.draftSlot,
            isPlayoff: entryRow.isPlayoff,
            isProjected: entryRow.isProjected,
            wins: entryRow.wins,
            losses: entryRow.losses,
            ties: entryRow.ties,
            winPct: entryRow.winPct.toString(),
            sos: entryRow.sos.toString(),
            pointsFor: entryRow.pointsFor ?? null,
            pointsAgainst: entryRow.pointsAgainst ?? null,
            team: {
              id: entryRow.Team.id,
              name: entryRow.Team.name,
              abbreviation: entryRow.Team.abbreviation ?? null,
            },
            audits,
          }
        })
      )

      // 3) return DTO
      return {
        id: snapshotRow.id,
        mode: snapshotRow.mode,
        strategy: snapshotRow.strategy ?? null,
        seasonYear: snapshotRow.seasonYear,
        seasonType: snapshotRow.seasonType,
        throughWeek: snapshotRow.throughWeek ?? null,
        source: snapshotRow.source,
        inputHash: snapshotRow.inputHash,
        computedAt: snapshotRow.computedAt.toISOString(),
        jobId: snapshotRow.jobId ?? null,
        entries: entryDtos,
      }
    })
  }
}
