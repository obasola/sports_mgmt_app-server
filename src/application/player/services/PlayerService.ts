// src/application/player/services/PlayerService.ts
import { IPlayerRepository } from '@/domain/player/repositories/IPlayerRepository';
import { Player } from '@/domain/player/entities/Player';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import { PlayerName } from '@/domain/player/value-objects/PlayerName';
import { PlayerLocation } from '@/domain/player/value-objects/PlayerLocation';
import { PlayerPhysicals } from '@/domain/player/value-objects/PlayerPhysicals';
import {
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerFiltersDto,
  PlayerResponseDto,
  PlayerStatisticsDto,
  PositionStatisticsDto,
  PlayerSearchDto,
  PlayerPhysicalRangeDto,
  PlayerBulkUpdateDto,
} from '../dto/PlayerDto';

export class PlayerService {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async createPlayer(dto: CreatePlayerDto): Promise<PlayerResponseDto> {
    // Business logic for creation
    // Check for duplicate players with same name
    const existingPlayers = await this.playerRepository.findByName(dto.firstName, dto.lastName);
    if (existingPlayers.length > 0) {
      // Allow duplicates but warn about potential conflicts
      console.warn(`Player with name ${dto.firstName} ${dto.lastName} already exists`);
    }

    // If prospectId is provided, validate that prospect exists and isn't already linked
    if (dto.prospectId) {
      const existingPlayerWithProspect = await this.playerRepository.findByProspectId(dto.prospectId);
      if (existingPlayerWithProspect) {
        throw new ConflictError(`Prospect ${dto.prospectId} is already linked to player ${existingPlayerWithProspect.id}`);
      }
    }

    const player = Player.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      age: dto.age,
      height: dto.height,
      weight: dto.weight,
      handSize: dto.handSize,
      armLength: dto.armLength,
      homeCity: dto.homeCity,
      homeState: dto.homeState,
      university: dto.university,
      status: dto.status,
      position: dto.position,
      yearEnteredLeague: dto.yearEnteredLeague,
      prospectId: dto.prospectId,
    });

    const savedPlayer = await this.playerRepository.save(player);
    return this.toResponseDto(savedPlayer);
  }

  async getPlayerById(id: number): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundError('Player', id);
    }
    return this.toResponseDto(player);
  }

  async getAllPlayers(
    filters?: PlayerFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PlayerResponseDto>> {
    const result = await this.playerRepository.findAll(filters, pagination);
    return {
      data: result.data.map((player) => this.toResponseDto(player)),
      pagination: result.pagination,
    };
  }

  async updatePlayer(id: number, dto: UpdatePlayerDto): Promise<PlayerResponseDto> {
    const existingPlayer = await this.playerRepository.findById(id);
    if (!existingPlayer) {
      throw new NotFoundError('Player', id);
    }

    // If prospectId is being updated, validate it's not already linked to another player
    if (dto.prospectId && dto.prospectId !== existingPlayer.prospectId) {
      const existingPlayerWithProspect = await this.playerRepository.findByProspectId(dto.prospectId);
      if (existingPlayerWithProspect && existingPlayerWithProspect.id !== id) {
        throw new ConflictError(`Prospect ${dto.prospectId} is already linked to player ${existingPlayerWithProspect.id}`);
      }
    }

    // Apply updates using domain methods
    if (dto.firstName !== undefined || dto.lastName !== undefined || dto.age !== undefined) {
      existingPlayer.updatePersonalInfo(
        dto.firstName ?? existingPlayer.firstName,
        dto.lastName ?? existingPlayer.lastName,
        dto.age ?? existingPlayer.age
      );
    }

    if (dto.height !== undefined || dto.weight !== undefined || dto.handSize !== undefined || dto.armLength !== undefined) {
      existingPlayer.updatePhysicals(
        dto.height ?? existingPlayer.height,
        dto.weight ?? existingPlayer.weight,
        dto.handSize ?? existingPlayer.handSize,
        dto.armLength ?? existingPlayer.armLength
      );
    }

    if (dto.homeCity !== undefined || dto.homeState !== undefined) {
      existingPlayer.updateLocation(
        dto.homeCity ?? existingPlayer.homeCity,
        dto.homeState ?? existingPlayer.homeState
      );
    }

    if (dto.university !== undefined || dto.status !== undefined || dto.position !== undefined || dto.yearEnteredLeague !== undefined) {
      existingPlayer.updateCareerInfo(
        dto.university ?? existingPlayer.university,
        dto.status ?? existingPlayer.status,
        dto.position ?? existingPlayer.position,
        dto.yearEnteredLeague ?? existingPlayer.yearEnteredLeague
      );
    }

    if (dto.prospectId !== undefined) {
      if (dto.prospectId === null) {
        existingPlayer.unlinkFromProspect();
      } else {
        existingPlayer.linkToProspect(dto.prospectId);
      }
    }

    const updatedPlayer = await this.playerRepository.update(id, existingPlayer);
    return this.toResponseDto(updatedPlayer);
  }

  async deletePlayer(id: number): Promise<void> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundError('Player', id);
    }

    // Business rule: Can't delete players who are active
    if (player.status === 'Active') {
      throw new ValidationError('Cannot delete active players. Change status first.');
    }

    await this.playerRepository.delete(id);
  }

  async playerExists(id: number): Promise<boolean> {
    return this.playerRepository.exists(id);
  }

  // Domain-specific service methods
  async searchPlayers(dto: PlayerSearchDto): Promise<PlayerResponseDto[]> {
    const filters: PlayerFiltersDto = {
      search: dto.query,
      position: dto.position,
      university: dto.university,
      status: dto.status,
    };

    const result = await this.playerRepository.findAll(filters);
    return result.data.map((player) => this.toResponseDto(player));
  }

  async getPlayersByPosition(position: string): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByPosition(position);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayersByUniversity(university: string): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByUniversity(university);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayerByProspectId(prospectId: number): Promise<PlayerResponseDto | null> {
    const player = await this.playerRepository.findByProspectId(prospectId);
    return player ? this.toResponseDto(player) : null;
  }

  async getRookies(): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findRookies();
    return players.map((player) => this.toResponseDto(player));
  }

  async getVeterans(minYears?: number): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findVeterans(minYears);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayersByYearEnteredLeague(year: number): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByYearEnteredLeague(year);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayersByStatus(status: string): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByStatus(status);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayersByLocation(city?: string, state?: string): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByLocation(city, state);
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayersByPhysicalRange(dto: PlayerPhysicalRangeDto): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.findByPhysicalRange(
      dto.minHeight,
      dto.maxHeight,
      dto.minWeight,
      dto.maxWeight
    );
    return players.map((player) => this.toResponseDto(player));
  }

  async getPlayerStatistics(): Promise<PlayerStatisticsDto> {
    const [averageAge, positionCounts, universityCounts, statusCounts] = await Promise.all([
      this.playerRepository.getAverageAge(),
      this.playerRepository.countByPosition(),
      this.playerRepository.countByUniversity(),
      this.playerRepository.countByStatus(),
    ]);

    return {
      averageAge: Math.round(averageAge * 100) / 100,
      positionCounts,
      universityCounts,
      statusCounts,
    };
  }

  async getPositionStatistics(position: string): Promise<PositionStatisticsDto | null> {
    const players = await this.playerRepository.findByPosition(position);
    if (players.length === 0) {
      return null;
    }

    const [averageHeight, averageWeight] = await Promise.all([
      this.playerRepository.getAverageHeightByPosition(position),
      this.playerRepository.getAverageWeightByPosition(position),
    ]);

    const averageAge = players.reduce((sum, player) => sum + player.age, 0) / players.length;

    return {
      position,
      averageHeight: averageHeight ? Math.round(averageHeight * 100) / 100 : undefined,
      averageWeight: averageWeight ? Math.round(averageWeight * 100) / 100 : undefined,
      averageAge: Math.round(averageAge * 100) / 100,
      count: players.length,
    };
  }

  async bulkUpdatePlayers(dto: PlayerBulkUpdateDto): Promise<PlayerResponseDto[]> {
    const updatedPlayers: PlayerResponseDto[] = [];

    for (const playerId of dto.playerIds) {
      try {
        const updatedPlayer = await this.updatePlayer(playerId, dto.updates);
        updatedPlayers.push(updatedPlayer);
      } catch (error) {
        if (error instanceof NotFoundError) {
          console.warn(`Player ${playerId} not found during bulk update`);
          continue;
        }
        throw error;
      }
    }

    return updatedPlayers;
  }

  private toResponseDto(player: Player): PlayerResponseDto {
    const name = new PlayerName(player.firstName, player.lastName);
    const location = new PlayerLocation(player.homeCity, player.homeState);
    const physicals = new PlayerPhysicals(player.height, player.weight, player.handSize, player.armLength);

    return {
      id: player.id!,
      firstName: player.firstName,
      lastName: player.lastName,
      fullName: name.getFullName(),
      age: player.age,
      height: player.height,
      weight: player.weight,
      handSize: player.handSize,
      armLength: player.armLength,
      homeCity: player.homeCity,
      homeState: player.homeState,
      homeLocation: location.getFormattedLocation() || undefined,
      university: player.university,
      status: player.status,
      position: player.position,
      yearEnteredLeague: player.yearEnteredLeague,
      prospectId: player.prospectId,
      yearsInLeague: player.calculateYearsInLeague(),
      isRookie: player.isRookie(),
      isVeteran: player.isVeteran(),
      heightFormatted: physicals.getHeightFormatted() || undefined,
      weightFormatted: physicals.getWeightFormatted() || undefined,
      bmi: physicals.getBMI(),

    };
  }
}