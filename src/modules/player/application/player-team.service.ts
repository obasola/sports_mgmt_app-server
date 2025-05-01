import { Result } from '../../../shared/domain/Result';
import { PlayerTeam } from '../domain/player-team.entity';
import { PlayerTeamRepository } from '../domain/player-team.repository';

export class PlayerTeamService {
  private readonly playerTeamRepository: PlayerTeamRepository;

  constructor(playerTeamRepository: PlayerTeamRepository) {
    this.playerTeamRepository = playerTeamRepository;
  }

  /**
   * Get a player-team relationship by id
   */
  async getPlayerTeamById(id: number): Promise<Result<PlayerTeam | null>> {
    return await this.playerTeamRepository.findById(id);
  }

  /**
   * Get all team history for a player
   */
  async getTeamHistoryForPlayer(playerId: number): Promise<Result<PlayerTeam[]>> {
    return await this.playerTeamRepository.findByPlayerId(playerId);
  }

  /**
   * Get all player history for a team
   */
  async getPlayerHistoryForTeam(teamId: number): Promise<Result<PlayerTeam[]>> {
    return await this.playerTeamRepository.findByTeamId(teamId);
  }

  /**
   * Get current team for a player
   */
  async getCurrentTeamForPlayer(playerId: number): Promise<Result<PlayerTeam | null>> {
    return await this.playerTeamRepository.findCurrentTeamForPlayer(playerId);
  }

  /**
   * Get current roster for a team
   */
  async getCurrentRosterForTeam(teamId: number): Promise<Result<PlayerTeam[]>> {
    return await this.playerTeamRepository.findCurrentPlayersForTeam(teamId);
  }

  /**
   * Add a player to a team
   */
  async addPlayerToTeam(
    playerId: number,
    teamId: number,
    makeCurrent = true,
    startDate: Date = new Date(),
  ): Promise<Result<PlayerTeam>> {
    const playerTeamResult = PlayerTeam.create({
      playerId,
      teamId,
      currentTeam: makeCurrent,
      startDate,
    });

    if (playerTeamResult.isFailure) {
      return Result.fail<PlayerTeam>(playerTeamResult.error as string);
    }

    const playerTeam = playerTeamResult.getValue();
    return await this.playerTeamRepository.create(playerTeam);
  }

  /**
   * Remove a player from their current team
   */
  async removePlayerFromCurrentTeam(playerId: number): Promise<Result<boolean>> {
    const currentTeamResult = await this.playerTeamRepository.findCurrentTeamForPlayer(playerId);

    if (currentTeamResult.isFailure) {
      return Result.fail<boolean>(currentTeamResult.error as string);
    }

    const currentTeam = currentTeamResult.getValue();
    if (!currentTeam) {
      return Result.fail<boolean>(
        `Player with ID ${playerId} is not currently assigned to any team`,
      );
    }

    // Make the team a former team
    const updatedTeamResult = currentTeam.makeFormerTeam();

    if (updatedTeamResult.isFailure) {
      return Result.fail<boolean>(updatedTeamResult.error as string);
    }

    const updatedTeam = updatedTeamResult.getValue();
    const updateResult = await this.playerTeamRepository.update(
      currentTeam.id as number,
      updatedTeam,
    );

    if (updateResult.isFailure) {
      return Result.fail<boolean>(updateResult.error as string);
    }

    return Result.ok<boolean>(true);
  }

  /**
   * Transfer a player to a new team
   */
  async transferPlayerToNewTeam(
    playerId: number,
    newTeamId: number,
    transferDate: Date = new Date(),
  ): Promise<Result<PlayerTeam>> {
    // Remove player from current team
    const removeResult = await this.removePlayerFromCurrentTeam(playerId);

    if (removeResult.isFailure) {
      // If player is not on a team, we can still proceed
      if (!removeResult.error?.includes('not currently assigned')) {
        return Result.fail<PlayerTeam>(removeResult.error as string);
      }
    }

    // Add player to new team
    return await this.addPlayerToTeam(playerId, newTeamId, true, transferDate);
  }

  /**
   * Update player-team relationship
   */
  async updatePlayerTeam(
    id: number,
    data: {
      currentTeam?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Result<PlayerTeam>> {
    const existingPlayerTeamResult = await this.playerTeamRepository.findById(id);

    if (existingPlayerTeamResult.isFailure) {
      return Result.fail<PlayerTeam>(existingPlayerTeamResult.error as string);
    }

    const existingPlayerTeam = existingPlayerTeamResult.getValue();
    if (!existingPlayerTeam) {
      return Result.fail<PlayerTeam>(`Player-team relationship with ID ${id} not found`);
    }

    let updatedPlayerTeam = existingPlayerTeam;

    // Update current team status if provided
    if (data.currentTeam !== undefined && data.currentTeam !== existingPlayerTeam.currentTeam) {
      if (data.currentTeam) {
        const makeCurrentResult = updatedPlayerTeam.makeCurrentTeam();
        if (makeCurrentResult.isFailure) {
          return Result.fail<PlayerTeam>(makeCurrentResult.error as string);
        }
        updatedPlayerTeam = makeCurrentResult.getValue();
      } else {
        const makeFormerResult = updatedPlayerTeam.makeFormerTeam();
        if (makeFormerResult.isFailure) {
          return Result.fail<PlayerTeam>(makeFormerResult.error as string);
        }
        updatedPlayerTeam = makeFormerResult.getValue();
      }
    }

    // Update dates if provided
    if (data.startDate !== undefined || data.endDate !== undefined) {
      const updateDatesResult = updatedPlayerTeam.updateDates(
        data.startDate !== undefined ? data.startDate : updatedPlayerTeam.startDate,
        data.endDate !== undefined ? data.endDate : updatedPlayerTeam.endDate,
      );

      if (updateDatesResult.isFailure) {
        return Result.fail<PlayerTeam>(updateDatesResult.error as string);
      }

      updatedPlayerTeam = updateDatesResult.getValue();
    }

    return await this.playerTeamRepository.update(id, updatedPlayerTeam);
  }

  /**
   * Delete a player-team relationship
   */
  async deletePlayerTeam(id: number): Promise<Result<boolean>> {
    return await this.playerTeamRepository.delete(id);
  }
}
