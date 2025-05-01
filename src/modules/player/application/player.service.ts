import { Player } from '../domain/player.entity';
import { PlayerRepository } from '../domain/player.repository';
import { Result } from '../../../shared/domain/Result';

export class PlayerService {
  private readonly playerRepository: PlayerRepository;

  constructor(playerRepository: PlayerRepository) {
    this.playerRepository = playerRepository;
  }

  /**
   * Get a player by id
   */
  async getPlayerById(id: number): Promise<Result<Player | null>> {
    return await this.playerRepository.findById(id);
  }

  /**
   * Get all players with optional pagination
   */
  async getAllPlayers(limit?: number, offset?: number): Promise<Result<Player[]>> {
    return await this.playerRepository.findAll(limit, offset);
  }

  /**
   * Create a new player
   */
  async createPlayer(playerData: {
    firstName: string;
    lastName: string;
    age: number;
    height?: number;
    weight?: number;
    handSize?: number;
    armLength?: number;
    homeCity?: string;
    homeState?: string;
    university?: string;
    status?: string;
    position?: string;
    pickId?: number;
    combineScoreId?: number;
    prospectId?: number;
    yearEnteredLeague?: Date;
  }): Promise<Result<Player>> {
    const playerResult = Player.create(playerData);

    if (playerResult.isFailure) {
      return Result.fail<Player>(playerResult.error as string);
    }

    const player = playerResult.getValue();
    return await this.playerRepository.create(player);
  }

  /**
   * Update an existing player
   */
  async updatePlayer(
    id: number,
    playerData: {
      firstName: string;
      lastName: string;
      age: number;
      height?: number;
      weight?: number;
      handSize?: number;
      armLength?: number;
      homeCity?: string;
      homeState?: string;
      university?: string;
      status?: string;
      position?: string;
      pickId?: number;
      combineScoreId?: number;
      prospectId?: number;
      yearEnteredLeague?: Date;
    }
  ): Promise<Result<Player>> {
    // Check if player exists
    const existingPlayerResult = await this.playerRepository.findById(id);

    if (existingPlayerResult.isFailure) {
      return Result.fail<Player>(existingPlayerResult.error as string);
    }

    const existingPlayer = existingPlayerResult.getValue();
    if (!existingPlayer) {
      return Result.fail<Player>(`Player with ID ${id} not found`);
    }

    // Create updated player entity
    const playerResult = Player.create({
      id,
      ...playerData,
    });

    if (playerResult.isFailure) {
      return Result.fail<Player>(playerResult.error as string);
    }

    const player = playerResult.getValue();
    return await this.playerRepository.update(id, player);
  }

  /**
   * Delete a player by id
   */
  async deletePlayer(id: number): Promise<Result<boolean>> {
    // Check if player exists
    const existingPlayerResult = await this.playerRepository.findById(id);

    if (existingPlayerResult.isFailure) {
      return Result.fail<boolean>(existingPlayerResult.error as string);
    }

    const existingPlayer = existingPlayerResult.getValue();
    if (!existingPlayer) {
      return Result.fail<boolean>(`Player with ID ${id} not found`);
    }

    return await this.playerRepository.delete(id);
  }

  /**
   * Get players by position
   */
  async getPlayersByPosition(position: string): Promise<Result<Player[]>> {
    return await this.playerRepository.findByFilters({ position });
  }

  /**
   * Get players by team
   */
  async getPlayersByTeam(teamId: number): Promise<Result<Player[]>> {
    return await this.playerRepository.findByTeamId(teamId);
  }

  /**
   * Get players by university
   */
  async getPlayersByUniversity(university: string): Promise<Result<Player[]>> {
    return await this.playerRepository.findByFilters({ university });
  }

  /**
   * Get players by age range
   */
  async getPlayersByAgeRange(minAge: number, maxAge: number): Promise<Result<Player[]>> {
    return await this.playerRepository.findByFilters({ ageMin: minAge, ageMax: maxAge });
  }

  /**
   * Get players by status
   */
  async getPlayersByStatus(status: string): Promise<Result<Player[]>> {
    return await this.playerRepository.findByFilters({ status });
  }

  /**
   * Get players by multiple filters
   */
  async getPlayersByFilters(filters: {
    position?: string;
    university?: string;
    status?: string;
    ageMin?: number;
    ageMax?: number;
  }): Promise<Result<Player[]>> {
    return await this.playerRepository.findByFilters(filters);
  }
}