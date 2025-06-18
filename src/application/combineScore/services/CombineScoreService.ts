// src/application/combineScore/services/CombineScoreService.ts
import { ICombineScoreRepository } from '@/domain/combineScore/repositories/ICombineScoreRepository';
import { CombineScore } from '@/domain/combineScore/entities/CombineScore';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateCombineScoreDto,
  UpdateCombineScoreDto,
  CombineScoreFiltersDto,
  CombineScoreResponseDto,
  TopPerformersDto,
  AthleticScoreRangeDto,
} from '../dto/CombineScoreDto';

export class CombineScoreService {
  constructor(private readonly combineScoreRepository: ICombineScoreRepository) {}

  async createCombineScore(dto: CreateCombineScoreDto): Promise<CombineScoreResponseDto> {
    // Business logic: Check if player already has combine scores
    if (dto.playerId) {
      const existingCombineScore = await this.combineScoreRepository.findByPlayerId(dto.playerId);
      if (existingCombineScore) {
        throw new ConflictError(`Player ${dto.playerId} already has combine scores recorded`);
      }
    }

    const combineScore = CombineScore.create({
      playerId: dto.playerId,
      fortyTime: dto.fortyTime,
      tenYardSplit: dto.tenYardSplit,
      twentyYardShuttle: dto.twentyYardShuttle,
      threeCone: dto.threeCone,
      verticalLeap: dto.verticalLeap,
      broadJump: dto.broadJump,
    });

    const savedCombineScore = await this.combineScoreRepository.save(combineScore);
    return this.toResponseDto(savedCombineScore);
  }

  async getCombineScoreById(id: number): Promise<CombineScoreResponseDto> {
    const combineScore = await this.combineScoreRepository.findById(id);
    if (!combineScore) {
      throw new NotFoundError('CombineScore', id);
    }
    return this.toResponseDto(combineScore);
  }

  async getAllCombineScores(
    filters?: CombineScoreFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<CombineScoreResponseDto>> {
    const result = await this.combineScoreRepository.findAll(filters, pagination);
    return {
      data: result.data.map((combineScore) => this.toResponseDto(combineScore)),
      pagination: result.pagination,
    };
  }

  async updateCombineScore(id: number, dto: UpdateCombineScoreDto): Promise<CombineScoreResponseDto> {
    const existingCombineScore = await this.combineScoreRepository.findById(id);
    if (!existingCombineScore) {
      throw new NotFoundError('CombineScore', id);
    }

    // Business logic: If updating playerId, check for conflicts
    if (dto.playerId && dto.playerId !== existingCombineScore.playerId) {
      const conflictingCombineScore = await this.combineScoreRepository.findByPlayerId(dto.playerId);
      if (conflictingCombineScore && conflictingCombineScore.id !== id) {
        throw new ConflictError(`Player ${dto.playerId} already has combine scores recorded`);
      }
    }

    // Apply updates to the entity
    const updatedProps = {
      id: existingCombineScore.id,
      playerId: dto.playerId ?? existingCombineScore.playerId,
      fortyTime: dto.fortyTime ?? existingCombineScore.fortyTime,
      tenYardSplit: dto.tenYardSplit ?? existingCombineScore.tenYardSplit,
      twentyYardShuttle: dto.twentyYardShuttle ?? existingCombineScore.twentyYardShuttle,
      threeCone: dto.threeCone ?? existingCombineScore.threeCone,
      verticalLeap: dto.verticalLeap ?? existingCombineScore.verticalLeap,
      broadJump: dto.broadJump ?? existingCombineScore.broadJump,
    };

    const updatedCombineScore = CombineScore.create(updatedProps);
    const savedCombineScore = await this.combineScoreRepository.update(id, updatedCombineScore);
    return this.toResponseDto(savedCombineScore);
  }

  async deleteCombineScore(id: number): Promise<void> {
    const combineScore = await this.combineScoreRepository.findById(id);
    if (!combineScore) {
      throw new NotFoundError('CombineScore', id);
    }

    await this.combineScoreRepository.delete(id);
  }

  async combineScoreExists(id: number): Promise<boolean> {
    return this.combineScoreRepository.exists(id);
  }

  async getCombineScoreByPlayerId(playerId: number): Promise<CombineScoreResponseDto | null> {
    const combineScore = await this.combineScoreRepository.findByPlayerId(playerId);
    return combineScore ? this.toResponseDto(combineScore) : null;
  }

  async getCombineScoresByPlayerIds(playerIds: number[]): Promise<CombineScoreResponseDto[]> {
    const combineScores = await this.combineScoreRepository.findByPlayerIds(playerIds);
    return combineScores.map((combineScore) => this.toResponseDto(combineScore));
  }

  async getTopPerformers(dto: TopPerformersDto): Promise<CombineScoreResponseDto[]> {
    const combineScores = await this.combineScoreRepository.findTopPerformers(dto.metric, dto.limit);
    return combineScores.map((combineScore) => this.toResponseDto(combineScore));
  }

  async getCombineScoresByAthleticScore(dto: AthleticScoreRangeDto): Promise<CombineScoreResponseDto[]> {
    const combineScores = await this.combineScoreRepository.findByAthleticScoreRange(dto.minScore, dto.maxScore);
    return combineScores.map((combineScore) => this.toResponseDto(combineScore));
  }

  async getAthleticRankings(): Promise<CombineScoreResponseDto[]> {
    // Business logic: Get all combine scores and rank by overall athletic score
    const allResults = await this.combineScoreRepository.findAll({}, { page: 1, limit: 1000 });
    
    return allResults.data
      .map((combineScore) => this.toResponseDto(combineScore))
      .sort((a, b) => b.overallAthleticScore - a.overallAthleticScore);
  }

  async updateSpecificMetric(id: number, metric: string, value: number): Promise<CombineScoreResponseDto> {
    const existingCombineScore = await this.combineScoreRepository.findById(id);
    if (!existingCombineScore) {
      throw new NotFoundError('CombineScore', id);
    }

    // Business logic: Update specific metric using domain methods
    switch (metric) {
      case 'fortyTime':
        existingCombineScore.updateFortyTime(value);
        break;
      case 'tenYardSplit':
        existingCombineScore.updateTenYardSplit(value);
        break;
      case 'verticalLeap':
        existingCombineScore.updateVerticalLeap(value);
        break;
      case 'broadJump':
        existingCombineScore.updateBroadJump(value);
        break;
      default:
        throw new Error(`Invalid metric: ${metric}`);
    }

    const savedCombineScore = await this.combineScoreRepository.update(id, existingCombineScore);
    return this.toResponseDto(savedCombineScore);
  }

  private toResponseDto(combineScore: CombineScore): CombineScoreResponseDto {
    return {
      id: combineScore.id!,
      playerId: combineScore.playerId,
      fortyTime: combineScore.fortyTime,
      tenYardSplit: combineScore.tenYardSplit,
      twentyYardShuttle: combineScore.twentyYardShuttle,
      threeCone: combineScore.threeCone,
      verticalLeap: combineScore.verticalLeap,
      broadJump: combineScore.broadJump,
      overallAthleticScore: combineScore.getOverallAthleticScore(),
      isCompleteWorkout: combineScore.isCompleteWorkout(),
      // Formatted values for better API response
      fortyTimeFormatted: combineScore.fortyTime ? `${combineScore.fortyTime.toFixed(2)}s` : undefined,
      verticalLeapFormatted: combineScore.verticalLeap ? `${combineScore.verticalLeap}"` : undefined,
      broadJumpFormatted: combineScore.broadJump ? `${combineScore.broadJump}"` : undefined,
    };
  }
}