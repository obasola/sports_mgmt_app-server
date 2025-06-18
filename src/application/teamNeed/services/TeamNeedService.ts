// src/application/teamNeed/services/TeamNeedService.ts
import { ITeamNeedRepository } from '@/domain/teamNeed/repositories/ITeamNeedRepository';
import { TeamNeed } from '@/domain/teamNeed/entities/TeamNeed';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateTeamNeedDto,
  UpdateTeamNeedDto,
  TeamNeedFiltersDto,
  TeamNeedResponseDto,
} from '../dto/TeamNeedDto';

export class TeamNeedService {
  constructor(private readonly teamNeedRepository: ITeamNeedRepository) {}

  async createTeamNeed(dto: CreateTeamNeedDto): Promise<TeamNeedResponseDto> {
    // Business logic: Check if similar need already exists for team/position/year
    const existingNeeds = await this.teamNeedRepository.findByTeamId(dto.teamId);
    const duplicateNeed = existingNeeds.find(need => 
      need.position === dto.position && 
      need.draftYear === dto.draftYear
    );

    if (duplicateNeed) {
      throw new ConflictError(
        `Team need for position ${dto.position} in year ${dto.draftYear || 'current'} already exists`
      );
    }

    const teamNeed = TeamNeed.create({
      teamId: dto.teamId,
      position: dto.position,
      priority: dto.priority,
      draftYear: dto.draftYear,
    });

    const savedTeamNeed = await this.teamNeedRepository.save(teamNeed);
    return this.toResponseDto(savedTeamNeed);
  }

  async getTeamNeedById(id: number): Promise<TeamNeedResponseDto> {
    const teamNeed = await this.teamNeedRepository.findById(id);
    if (!teamNeed) {
      throw new NotFoundError('TeamNeed', id);
    }
    return this.toResponseDto(teamNeed);
  }

  async getAllTeamNeeds(
    filters?: TeamNeedFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TeamNeedResponseDto>> {
    const result = await this.teamNeedRepository.findAll(filters, pagination);
    return {
      data: result.data.map((teamNeed) => this.toResponseDto(teamNeed)),
      pagination: result.pagination,
    };
  }

  async updateTeamNeed(id: number, dto: UpdateTeamNeedDto): Promise<TeamNeedResponseDto> {
    const existingTeamNeed = await this.teamNeedRepository.findById(id);
    if (!existingTeamNeed) {
      throw new NotFoundError('TeamNeed', id);
    }

    // Business logic: If changing position or draft year, check for duplicates
    if ((dto.position && dto.position !== existingTeamNeed.position) ||
        (dto.draftYear && dto.draftYear !== existingTeamNeed.draftYear)) {
      
      const teamId = dto.teamId || existingTeamNeed.teamId!;
      const position = dto.position || existingTeamNeed.position!;
      const draftYear = dto.draftYear || existingTeamNeed.draftYear;
      
      const existingNeeds = await this.teamNeedRepository.findByTeamId(teamId);
      const duplicateNeed = existingNeeds.find(need => 
        need.id !== id && 
        need.position === position && 
        need.draftYear === draftYear
      );

      if (duplicateNeed) {
        throw new ConflictError(
          `Team need for position ${position} in year ${draftYear || 'current'} already exists`
        );
      }
    }

    // Apply updates to entity
    if (dto.priority !== undefined) {
      existingTeamNeed.updatePriority(dto.priority);
    }
    if (dto.position !== undefined) {
      existingTeamNeed.updatePosition(dto.position);
    }
    if (dto.draftYear !== undefined) {
      existingTeamNeed.updateDraftYear(dto.draftYear);
    }

    const updatedTeamNeed = await this.teamNeedRepository.update(id, existingTeamNeed);
    return this.toResponseDto(updatedTeamNeed);
  }

  async deleteTeamNeed(id: number): Promise<void> {
    const teamNeed = await this.teamNeedRepository.findById(id);
    if (!teamNeed) {
      throw new NotFoundError('TeamNeed', id);
    }

    await this.teamNeedRepository.delete(id);
  }

  async teamNeedExists(id: number): Promise<boolean> {
    return this.teamNeedRepository.exists(id);
  }

  // Domain-specific business methods
  async getTeamNeeds(teamId: number): Promise<TeamNeedResponseDto[]> {
    const teamNeeds = await this.teamNeedRepository.findByTeamId(teamId);
    return teamNeeds.map((teamNeed) => this.toResponseDto(teamNeed));
  }

  async getHighPriorityNeeds(teamId?: number): Promise<TeamNeedResponseDto[]> {
    const teamNeeds = await this.teamNeedRepository.findHighPriorityNeeds(teamId);
    return teamNeeds.map((teamNeed) => this.toResponseDto(teamNeed));
  }

  async getNeedsByPosition(position: string): Promise<TeamNeedResponseDto[]> {
    const teamNeeds = await this.teamNeedRepository.findByPosition(position);
    return teamNeeds.map((teamNeed) => this.toResponseDto(teamNeed));
  }

  async getNeedsByDraftYear(draftYear: number): Promise<TeamNeedResponseDto[]> {
    const teamNeeds = await this.teamNeedRepository.findByDraftYear(draftYear);
    return teamNeeds.map((teamNeed) => this.toResponseDto(teamNeed));
  }

  async updateTeamNeedPriority(id: number, priority: number): Promise<TeamNeedResponseDto> {
    const teamNeed = await this.teamNeedRepository.findById(id);
    if (!teamNeed) {
      throw new NotFoundError('TeamNeed', id);
    }

    teamNeed.updatePriority(priority);
    const updatedTeamNeed = await this.teamNeedRepository.update(id, teamNeed);
    return this.toResponseDto(updatedTeamNeed);
  }

  private toResponseDto(teamNeed: TeamNeed): TeamNeedResponseDto {
    return {
      id: teamNeed.id!,
      teamId: teamNeed.teamId,
      position: teamNeed.position,
      priority: teamNeed.priority,
      draftYear: teamNeed.draftYear,
      isHighPriority: teamNeed.isHighPriority(),
      isForCurrentDraft: teamNeed.isForCurrentDraft(),
      createdAt: teamNeed.createdAt?.toISOString(),
      updatedAt: teamNeed.updatedAt?.toISOString(),
    };
  }
}