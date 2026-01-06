import { ITeamNeedRepository } from "../../domain/services/repositories/ITeamNeedRepository";

export class DeleteTeamNeedUseCase {
  public constructor(private readonly teamNeedRepo: ITeamNeedRepository) {}

  public async execute(teamId: number, position: string): Promise<void> {
    const pos = position.trim().toUpperCase();
    if (pos.length === 0 || pos.length > 10) {
      throw new Error("position must be 1..10 characters");
    }
    await this.teamNeedRepo.deleteByTeamIdAndPosition(teamId, pos);
  }
}

