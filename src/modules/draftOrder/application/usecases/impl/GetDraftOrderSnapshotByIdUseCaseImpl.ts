import type { GetDraftOrderSnapshotByIdUseCase } from '../GetDraftOrderSnapshotByIdUseCase'
import type { DraftOrderSnapshotDetailDto } from '../../dtos/DraftOrderSnapshotDetailDto'
import type {
    DraftOrderSnapshotDetail,
  DraftOrderSnapshotRepository,
} from '../../../../draftOrder/domain/repositories/DraftOrderSnapshotRepository'

export class GetDraftOrderSnapshotByIdUseCaseImpl implements GetDraftOrderSnapshotByIdUseCase {
  constructor(private readonly repo: DraftOrderSnapshotRepository) {}

  async execute(id: number): Promise<DraftOrderSnapshotDetailDto | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error('id must be a positive integer')

    const snapshot: DraftOrderSnapshotDetail | null = await this.repo.getSnapshotById(id)
    if (!snapshot) return null

    return {
      id: snapshot.id,
      mode: snapshot.mode,
      strategy: snapshot.strategy,
      seasonYear: snapshot.seasonYear,
      seasonType: snapshot.seasonType,
      throughWeek: snapshot.throughWeek,
      source: snapshot.source,
      inputHash: snapshot.inputHash,
      computedAt: snapshot.computedAt.toString(),
      jobId: snapshot.jobId,
      entries: snapshot.entries.map((e) => ({
        id: e.id,
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
        audits: e.audits.map((a) => ({
          id: a.id,
          stepNbr: a.stepNbr,
          ruleCode: a.ruleCode,
          resultCode: a.resultCode,
          resultSummary: a.resultSummary,
          detailsJson: a.detailsJson,
          createdAt: a.createdAt.toString(),
        })),
      })),
    }
  }
}
