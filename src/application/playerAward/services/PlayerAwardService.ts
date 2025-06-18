// src/application/playerAward/services/PlayerAwardService.ts

import { IPlayerAwardRepository } from '@/domain/playerAward/repositories/IPlayerAwardRepository';
import { PlayerAward } from '@/domain/playerAward/entities/PlayerAward';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreatePlayerAwardDto,
  UpdatePlayerAwardDto,
  PlayerAwardFiltersDto,
  PlayerAwardResponseDto,
} from '../dto/PlayerAwardDto';

export class PlayerAwardService {
  constructor(private readonly playerAwardRepository: IPlayerAwardRepository) {}

  async createPlayerAward(dto: CreatePlayerAwardDto): Promise<PlayerAwardResponseDto> {
    // Business logic: Check for duplicate awards for the same player and year
    if (dto.awardName && dto.yearAwarded) {
      const existingAwards = await this.playerAwardRepository.findByPlayerId(dto.playerId);
      const duplicateAward = existingAwards.find(
        award => award.awardName === dto.awardName && award.yearAwarded === dto.yearAwarded
      );
      
      if (duplicateAward) {
        throw new ConflictError(`Player already has the award "${dto.awardName}" for year ${dto.yearAwarded}`);
      }
    }

    const playerAward = PlayerAward.create({
      playerId: dto.playerId,
      awardName: dto.awardName,
      yearAwarded: dto.yearAwarded,
    });

    const savedPlayerAward = await this.playerAwardRepository.save(playerAward);
    return this.toResponseDto(savedPlayerAward);
  }

  async getPlayerAwardById(id: number): Promise<PlayerAwardResponseDto> {
    const playerAward = await this.playerAwardRepository.findById(id);
    if (!playerAward) {
      throw new NotFoundError('PlayerAward', id);
    }
    return this.toResponseDto(playerAward);
  }

  async getAllPlayerAwards(
    filters?: PlayerAwardFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PlayerAwardResponseDto>> {
    const result = await this.playerAwardRepository.findAll(filters, pagination);
    return {
      data: result.data.map((playerAward) => this.toResponseDto(playerAward)),
      pagination: result.pagination,
    };
  }

  async updatePlayerAward(id: number, dto: UpdatePlayerAwardDto): Promise<PlayerAwardResponseDto> {
    const existingPlayerAward = await this.playerAwardRepository.findById(id);
    if (!existingPlayerAward) {
      throw new NotFoundError('PlayerAward', id);
    }

    // Business logic: Check for duplicate awards if updating award name or year
    if (dto.awardName || dto.yearAwarded) {
      const currentAwardName = dto.awardName || existingPlayerAward.awardName;
      const currentYear = dto.yearAwarded || existingPlayerAward.yearAwarded;
      
      if (currentAwardName && currentYear) {
        const playerAwards = await this.playerAwardRepository.findByPlayerId(existingPlayerAward.playerId);
        const duplicateAward = playerAwards.find(
          award => award.id !== id && 
                   award.awardName === currentAwardName && 
                   award.yearAwarded === currentYear
        );
        
        if (duplicateAward) {
          throw new ConflictError(`Player already has the award "${currentAwardName}" for year ${currentYear}`);
        }
      }
    }

    // Apply updates
    if (dto.awardName !== undefined) {
      existingPlayerAward.updateAwardName(dto.awardName);
    }
    if (dto.yearAwarded !== undefined) {
      existingPlayerAward.updateYearAwarded(dto.yearAwarded);
    }

    const updatedPlayerAward = await this.playerAwardRepository.update(id, existingPlayerAward);
    return this.toResponseDto(updatedPlayerAward);
  }

  async deletePlayerAward(id: number): Promise<void> {
    const playerAward = await this.playerAwardRepository.findById(id);
    if (!playerAward) {
      throw new NotFoundError('PlayerAward', id);
    }

    await this.playerAwardRepository.delete(id);
  }

  async playerAwardExists(id: number): Promise<boolean> {
    return this.playerAwardRepository.exists(id);
  }

  async getPlayerAwardsByPlayerId(playerId: number): Promise<PlayerAwardResponseDto[]> {
    const playerAwards = await this.playerAwardRepository.findByPlayerId(playerId);
    return playerAwards.map((playerAward) => this.toResponseDto(playerAward));
  }

  async getPlayerAwardsByAwardName(awardName: string): Promise<PlayerAwardResponseDto[]> {
    const playerAwards = await this.playerAwardRepository.findByAwardName(awardName);
    return playerAwards.map((playerAward) => this.toResponseDto(playerAward));
  }

  async getPlayerAwardsByYear(year: number): Promise<PlayerAwardResponseDto[]> {
    const playerAwards = await this.playerAwardRepository.findByYear(year);
    return playerAwards.map((playerAward) => this.toResponseDto(playerAward));
  }

  async getPlayerAwardCount(playerId: number): Promise<number> {
    return this.playerAwardRepository.countByPlayer(playerId);
  }

  private toResponseDto(playerAward: PlayerAward): PlayerAwardResponseDto {
    return {
      id: playerAward.id!,
      playerId: playerAward.playerId,
      awardName: playerAward.awardName,
      yearAwarded: playerAward.yearAwarded,
      displayName: playerAward.getDisplayName(),
      isRecentAward: playerAward.isRecentAward(),
    };
  }
}