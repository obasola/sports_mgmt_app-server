import { ITeamNeedRepository } from "../../domain/services/repositories/ITeamNeedRepository";
import { TeamNeedDto } from "../../domain/dtos/TeamNeedDtos";

export interface UpsertTeamNeedInput {
  teamId: number;
  position: string;
  priority: number; // 1..5
  draftYear: number | null;
}

export class UpsertTeamNeedUseCase {
  public constructor(private readonly teamNeedRepo: ITeamNeedRepository) {}

  public async execute(input: UpsertTeamNeedInput): Promise<TeamNeedDto> {
    const position = input.position.trim().toUpperCase();
    if (position.length === 0 || position.length > 10) {
      throw new Error("position must be 1..10 characters");
    }
    if (!Number.isInteger(input.priority) || input.priority < 1 || input.priority > 5) {
      throw new Error("priority must be an integer 1..5");
    }

    return this.teamNeedRepo.upsert({
      teamId: input.teamId,
      position,
      priority: input.priority,
      draftYear: input.draftYear
    });
  }
}

