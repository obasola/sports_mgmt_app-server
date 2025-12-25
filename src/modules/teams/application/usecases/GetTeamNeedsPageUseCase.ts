import { ITeamNeedRepository } from "../../domain/services/repositories/ITeamNeedRepository";
import { ITeamRosterRepository } from "../../domain/services/repositories/ITeamRosterRepository";
import { TeamNeedsAnalyzerService } from "../../domain/services/TeamNeedsAnalyzerService";
import { TeamNeedsPageDto } from "../../domain/dtos/TeamNeedDtos";

export interface GetTeamNeedsPageInput {
  teamId: number;
  evaluationYear?: number; // default current year
  draftYear?: number | null;
}

export class GetTeamNeedsPageUseCase {
  public constructor(
    private readonly teamNeedRepo: ITeamNeedRepository,
    private readonly rosterRepo: ITeamRosterRepository,
    private readonly analyzer: TeamNeedsAnalyzerService
  ) {}

  public async execute(input: GetTeamNeedsPageInput): Promise<TeamNeedsPageDto> {
    const evaluationYear = input.evaluationYear ?? new Date().getFullYear();
    const draftYear = input.draftYear ?? null;

    const [persistedNeeds, roster] = await Promise.all([
      this.teamNeedRepo.listByTeamId(input.teamId),
      this.rosterRepo.getCurrentRoster(input.teamId)
    ]);

    const suggestions = this.analyzer.analyze(roster, { evaluationYear, draftYear });

    return {
      teamId: input.teamId,
      evaluationYear,
      persistedNeeds,
      suggestions
    };
  }
}

