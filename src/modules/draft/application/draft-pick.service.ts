import { Result } from '../../../shared/domain/Result';
import { DraftPick, DraftPickProps } from '../domain/draft-pick.entity';
import { DraftPickRepository } from '../domain/draft-pick.repository';

export class DraftPickService {
  private readonly draftPickRepository: DraftPickRepository;

  constructor(draftPickRepository: DraftPickRepository) {
    this.draftPickRepository = draftPickRepository;
  }

  /**
   * Get a draft pick by id
   */
  async getDraftPickById(id: number): Promise<Result<DraftPick | null>> {
    return await this.draftPickRepository.findById(id);
  }

  /**
   * Get all draft picks with optional pagination
   */
  async getAllDraftPicks(limit?: number, offset?: number): Promise<Result<DraftPick[]>> {
    return await this.draftPickRepository.findAll(limit, offset);
  }

  /**
   * Create a new draft pick
   */
  async createDraftPick(draftPickData: {
    round: number;
    pickNumber: number;
    draftYear: number;
    currentTeamId: number;
    prospectId?: number;
    playerId?: number;
    used?: boolean;
    originalTeam?: number;
  }): Promise<Result<DraftPick>> {
    // Check if a draft pick already exists with the same round, pick, and year
    const existingDraftPickResult = await this.draftPickRepository.findByRoundPickYear(
      draftPickData.round,
      draftPickData.pickNumber,
      draftPickData.draftYear,
    );

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (existingDraftPick) {
      return Result.fail<DraftPick>(
        `Draft pick with Round ${draftPickData.round}, Pick ${draftPickData.pickNumber} in ${draftPickData.draftYear} already exists`,
      );
    }

    const draftPickResult = DraftPick.create(draftPickData as any as DraftPickProps);

    if (draftPickResult.isFailure) {
      return Result.fail<DraftPick>(draftPickResult.error as string);
    }

    const draftPick = draftPickResult.getValue();
    return await this.draftPickRepository.create(draftPick);
  }

  /**
   * Update an existing draft pick
   */
  async updateDraftPick(
    id: number,
    draftPickData: {
      round?: number;
      pickNumber?: number;
      draftYear?: number;
      currentTeamId?: number;
      prospectId?: number;
      playerId?: number;
      used?: boolean;
      originalTeam?: number;
    },
  ): Promise<Result<DraftPick>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(id);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<DraftPick>(`Draft pick with ID ${id} not found`);
    }

    // If updating round, pick, or year, check for uniqueness
    if (
      draftPickData.round !== undefined ||
      draftPickData.pickNumber !== undefined ||
      draftPickData.draftYear !== undefined
    ) {
      const round =
        draftPickData.round !== undefined ? draftPickData.round : existingDraftPick.round;
      const pickNumber =
        draftPickData.pickNumber !== undefined
          ? draftPickData.pickNumber
          : existingDraftPick.pickNumber;
      const draftYear =
        draftPickData.draftYear !== undefined
          ? draftPickData.draftYear
          : existingDraftPick.draftYear;

      // Skip uniqueness check if values don't change
      if (
        round !== existingDraftPick.round ||
        pickNumber !== existingDraftPick.pickNumber ||
        draftYear !== existingDraftPick.draftYear
      ) {
        const otherDraftPickResult = await this.draftPickRepository.findByRoundPickYear(
          round,
          pickNumber,
          draftYear,
        );

        if (otherDraftPickResult.isFailure) {
          return Result.fail<DraftPick>(otherDraftPickResult.error as string);
        }

        const otherDraftPick = otherDraftPickResult.getValue();
        if (otherDraftPick && otherDraftPick.id !== id) {
          return Result.fail<DraftPick>(
            `Draft pick with Round ${round}, Pick ${pickNumber} in ${draftYear} already exists`,
          );
        }
      }
    }

    // Create updated draft pick with merged data
    const mergedData = {
      id,
      round: draftPickData.round !== undefined ? draftPickData.round : existingDraftPick.round,
      pickNumber:
        draftPickData.pickNumber !== undefined
          ? draftPickData.pickNumber
          : existingDraftPick.pickNumber,
      draftYear:
        draftPickData.draftYear !== undefined
          ? draftPickData.draftYear
          : existingDraftPick.draftYear,
      currentTeamId:
        draftPickData.currentTeamId !== undefined
          ? draftPickData.currentTeamId
          : existingDraftPick.currentTeamId,
      prospectId:
        draftPickData.prospectId !== undefined
          ? draftPickData.prospectId
          : existingDraftPick.prospectId,
      playerId:
        draftPickData.playerId !== undefined ? draftPickData.playerId : existingDraftPick.playerId,
      used: draftPickData.used !== undefined ? draftPickData.used : existingDraftPick.used,
      originalTeam:
        draftPickData.originalTeam !== undefined
          ? draftPickData.originalTeam
          : existingDraftPick.originalTeam,
    };

    const draftPickResult = DraftPick.create(mergedData);

    if (draftPickResult.isFailure) {
      return Result.fail<DraftPick>(draftPickResult.error as string);
    }

    const draftPick = draftPickResult.getValue();
    return await this.draftPickRepository.update(id, draftPick);
  }

  /**
   * Delete a draft pick by id
   */
  async deleteDraftPick(id: number): Promise<Result<boolean>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(id);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<boolean>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<boolean>(`Draft pick with ID ${id} not found`);
    }

    return await this.draftPickRepository.delete(id);
  }

  /**
   * Get draft picks by draft year
   */
  async getDraftPicksByYear(draftYear: number): Promise<Result<DraftPick[]>> {
    return await this.draftPickRepository.findByDraftYear(draftYear);
  }

  /**
   * Get draft picks owned by a team
   */
  async getDraftPicksByTeam(teamId: number): Promise<Result<DraftPick[]>> {
    return await this.draftPickRepository.findByTeam(teamId);
  }

  /**
   * Get unused draft picks owned by a team
   */
  async getUnusedDraftPicksByTeam(teamId: number): Promise<Result<DraftPick[]>> {
    return await this.draftPickRepository.findUnusedByTeam(teamId);
  }

  /**
   * Get draft pick by prospect
   */
  async getDraftPickByProspect(prospectId: number): Promise<Result<DraftPick | null>> {
    return await this.draftPickRepository.findByProspectId(prospectId);
  }

  /**
   * Get draft pick by player
   */
  async getDraftPickByPlayer(playerId: number): Promise<Result<DraftPick | null>> {
    return await this.draftPickRepository.findByPlayerId(playerId);
  }

  /**
   * Get draft pick by round, pick number, and year
   */
  async getDraftPickByRoundPickYear(
    round: number,
    pickNumber: number,
    draftYear: number,
  ): Promise<Result<DraftPick | null>> {
    return await this.draftPickRepository.findByRoundPickYear(round, pickNumber, draftYear);
  }

  /**
   * Use a draft pick to select a prospect
   */
  async useDraftPickForProspect(
    draftPickId: number,
    prospectId: number,
  ): Promise<Result<DraftPick>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(draftPickId);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<DraftPick>(`Draft pick with ID ${draftPickId} not found`);
    }

    // Check if draft pick is already used
    if (existingDraftPick.used) {
      return Result.fail<DraftPick>(
        `Draft pick (${existingDraftPick.formattedPickWithYear}) is already used`,
      );
    }

    // Link to prospect and mark as used
    const updatedDraftPickResult = existingDraftPick.linkToProspect(prospectId);

    if (updatedDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(updatedDraftPickResult.error as string);
    }

    const updatedDraftPick = updatedDraftPickResult.getValue();
    return await this.draftPickRepository.update(draftPickId, updatedDraftPick);
  }

  /**
   * Change the team that owns a draft pick (trade)
   */
  async tradeDraftPick(draftPickId: number, newTeamId: number): Promise<Result<DraftPick>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(draftPickId);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<DraftPick>(`Draft pick with ID ${draftPickId} not found`);
    }

    // Update team
    const updatedDraftPickResult = existingDraftPick.updateTeam(newTeamId);

    if (updatedDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(updatedDraftPickResult.error as string);
    }

    const updatedDraftPick = updatedDraftPickResult.getValue();
    return await this.draftPickRepository.update(draftPickId, updatedDraftPick);
  }

  /**
   * Set the original team for a draft pick
   */
  async setOriginalTeam(draftPickId: number, teamId: number): Promise<Result<DraftPick>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(draftPickId);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<DraftPick>(`Draft pick with ID ${draftPickId} not found`);
    }

    // Set original team
    const updatedDraftPickResult = existingDraftPick.setOriginalTeam(teamId);

    if (updatedDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(updatedDraftPickResult.error as string);
    }

    const updatedDraftPick = updatedDraftPickResult.getValue();
    return await this.draftPickRepository.update(draftPickId, updatedDraftPick);
  }

  /**
   * Reset a draft pick (mark as unused and remove prospect)
   */
  async resetDraftPick(draftPickId: number): Promise<Result<DraftPick>> {
    // Check if draft pick exists
    const existingDraftPickResult = await this.draftPickRepository.findById(draftPickId);

    if (existingDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(existingDraftPickResult.error as string);
    }

    const existingDraftPick = existingDraftPickResult.getValue();
    if (!existingDraftPick) {
      return Result.fail<DraftPick>(`Draft pick with ID ${draftPickId} not found`);
    }

    // Mark as unused
    const updatedDraftPickResult = existingDraftPick.markAsUnused();

    if (updatedDraftPickResult.isFailure) {
      return Result.fail<DraftPick>(updatedDraftPickResult.error as string);
    }

    const updatedDraftPick = updatedDraftPickResult.getValue();
    return await this.draftPickRepository.update(draftPickId, updatedDraftPick);
  }

  /**
   * Get draft picks by filters
   */
  async getDraftPicksByFilters(filters: {
    round?: number;
    pickNumber?: number;
    draftYear?: number;
    currentTeamId?: number;
    used?: boolean;
    originalTeam?: number;
  }): Promise<Result<DraftPick[]>> {
    return await this.draftPickRepository.findByFilters(filters);
  }
}
