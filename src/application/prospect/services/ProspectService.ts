// src/application/prospect/services/ProspectService.ts
import { IProspectRepository } from '@/domain/prospect/repositories/IProspectRepository';
import { Prospect } from '@/domain/prospect/entities/Prospect';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateProspectDto,
  UpdateProspectDto,
  ProspectFiltersDto,
  ProspectResponseDto,
  UpdatePersonalInfoDto,
  UpdateCombineScoresDto,
  MarkAsDraftedDto,
  CombineScoreFilterDto,
  ProspectStatsDto,
  TopAthletesResponseDto,
} from '../dto/ProspectDto';

export class ProspectService {
  constructor(private readonly prospectRepository: IProspectRepository) {}

  async createProspect(dto: CreateProspectDto): Promise<ProspectResponseDto> {
    // Check for potential duplicates
    const existingProspects = await this.prospectRepository.findAll({
      firstName: dto.firstName,
      lastName: dto.lastName,
      college: dto.college,
    });

    if (existingProspects.data.length > 0) {
      throw new ConflictError(
        `A prospect with the name ${dto.firstName} ${dto.lastName} from ${dto.college} already exists`
      );
    }

    const prospect = Prospect.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      position: dto.position,
      college: dto.college,
      height: dto.height,
      weight: dto.weight,
      handSize: dto.handSize,
      armLength: dto.armLength,
      homeCity: dto.homeCity,
      homeState: dto.homeState,
      fortyTime: dto.fortyTime,
      tenYardSplit: dto.tenYardSplit,
      verticalLeap: dto.verticalLeap,
      broadJump: dto.broadJump,
      threeCone: dto.threeCone,
      twentyYardShuttle: dto.twentyYardShuttle,
      benchPress: dto.benchPress,
      drafted: dto.drafted,
      draftYear: dto.draftYear,
      teamId: dto.teamId,
      draftPickId: dto.draftPickId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedProspect = await this.prospectRepository.save(prospect);
    return this.toResponseDto(savedProspect);
  }

  async getProspectById(id: number): Promise<ProspectResponseDto> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }
    return this.toResponseDto(prospect);
  }

  async getAllProspects(
    filters?: ProspectFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findAll(filters, pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async updateProspect(id: number, dto: UpdateProspectDto): Promise<ProspectResponseDto> {
    const existingProspect = await this.prospectRepository.findById(id);
    if (!existingProspect) {
      throw new NotFoundError('Prospect', id);
    }

    // Create updated prospect with merged data
    const updatedProspect = Prospect.create({
      id: existingProspect.id,
      firstName: dto.firstName ?? existingProspect.firstName,
      lastName: dto.lastName ?? existingProspect.lastName,
      position: dto.position ?? existingProspect.position,
      college: dto.college ?? existingProspect.college,
      height: dto.height ?? existingProspect.height,
      weight: dto.weight ?? existingProspect.weight,
      handSize: dto.handSize ?? existingProspect.handSize,
      armLength: dto.armLength ?? existingProspect.armLength,
      homeCity: dto.homeCity ?? existingProspect.homeCity,
      homeState: dto.homeState ?? existingProspect.homeState,
      fortyTime: dto.fortyTime ?? existingProspect.fortyTime,
      tenYardSplit: dto.tenYardSplit ?? existingProspect.tenYardSplit,
      verticalLeap: dto.verticalLeap ?? existingProspect.verticalLeap,
      broadJump: dto.broadJump ?? existingProspect.broadJump,
      threeCone: dto.threeCone ?? existingProspect.threeCone,
      twentyYardShuttle: dto.twentyYardShuttle ?? existingProspect.twentyYardShuttle,
      benchPress: dto.benchPress ?? existingProspect.benchPress,
      drafted: dto.drafted ?? existingProspect.drafted,
      draftYear: dto.draftYear ?? existingProspect.draftYear,
      teamId: dto.teamId ?? existingProspect.teamId,
      draftPickId: dto.draftPickId ?? existingProspect.draftPickId,
      createdAt: existingProspect.createdAt,
      updatedAt: new Date(),
    });

    const savedProspect = await this.prospectRepository.update(id, updatedProspect);
    return this.toResponseDto(savedProspect);
  }

  async deleteProspect(id: number): Promise<void> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }

    // Check if prospect is already drafted - might want to prevent deletion
    if (prospect.drafted) {
      throw new ConflictError('Cannot delete a drafted prospect');
    }

    await this.prospectRepository.delete(id);
  }

  async prospectExists(id: number): Promise<boolean> {
    return this.prospectRepository.exists(id);
  }

  async getProspectsByPosition(position: string, pagination?: PaginationParams): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findByPosition(position, pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async getProspectsByCollege(college: string, pagination?: PaginationParams): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findByCollege(college, pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async getUndraftedProspects(pagination?: PaginationParams): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findUndrafted(pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async getDraftedProspects(draftYear?: number, pagination?: PaginationParams): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findDrafted(draftYear, pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async getProspectsByTeam(teamId: number, pagination?: PaginationParams): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findByTeam(teamId, pagination);
    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async updatePersonalInfo(id: number, dto: UpdatePersonalInfoDto): Promise<ProspectResponseDto> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }

    prospect.updatePersonalInfo(
      dto.firstName,
      dto.lastName,
      dto.homeCity,
      dto.homeState
    );

    const updatedProspect = await this.prospectRepository.update(id, prospect);
    return this.toResponseDto(updatedProspect);
  }

  async updateCombineScores(id: number, dto: UpdateCombineScoresDto): Promise<ProspectResponseDto> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }

    prospect.updateCombineScores({
      fortyTime: dto.fortyTime,
      tenYardSplit: dto.tenYardSplit,
      verticalLeap: dto.verticalLeap,
      broadJump: dto.broadJump,
      threeCone: dto.threeCone,
      twentyYardShuttle: dto.twentyYardShuttle,
      benchPress: dto.benchPress,
    });

    const updatedProspect = await this.prospectRepository.update(id, prospect);
    return this.toResponseDto(updatedProspect);
  }

  async markAsDrafted(id: number, dto: MarkAsDraftedDto): Promise<ProspectResponseDto> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }

    prospect.markAsDrafted(dto.teamId, dto.draftYear, dto.draftPickId);

    const updatedProspect = await this.prospectRepository.update(id, prospect);
    return this.toResponseDto(updatedProspect);
  }

  async markAsUndrafted(id: number): Promise<ProspectResponseDto> {
    const prospect = await this.prospectRepository.findById(id);
    if (!prospect) {
      throw new NotFoundError('Prospect', id);
    }

    prospect.markAsUndrafted();

    const updatedProspect = await this.prospectRepository.update(id, prospect);
    return this.toResponseDto(updatedProspect);
  }

  async getTopAthletes(limit: number = 10): Promise<TopAthletesResponseDto> {
    const prospects = await this.prospectRepository.findTopAthletes(limit);
    
    return {
      prospects: prospects.map((prospect) => this.toResponseDto(prospect)),
      limit,
      criteria: 'Based on 40-yard dash, vertical leap, and bench press scores',
    };
  }

  async getProspectsByCombineScore(
    filters: CombineScoreFilterDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ProspectResponseDto>> {
    const result = await this.prospectRepository.findByCombineScore(
      filters.minFortyTime,
      filters.maxFortyTime,
      filters.minVerticalLeap,
      filters.maxVerticalLeap,
      pagination
    );

    return {
      data: result.data.map((prospect) => this.toResponseDto(prospect)),
      pagination: result.pagination,
    };
  }

  async getProspectStats(): Promise<ProspectStatsDto> {
    const [
      allProspects,
      draftedProspects,
      undraftedProspects,
      positionBreakdown,
      collegeBreakdown,
    ] = await Promise.all([
      this.prospectRepository.findAll(),
      this.prospectRepository.findDrafted(),
      this.prospectRepository.findUndrafted(),
      this.prospectRepository.countByPosition(),
      this.prospectRepository.countByCollege(),
    ]);

    const prospects = allProspects.data;
    const totalProspects = prospects.length;

    // Calculate averages
    const averageHeight = prospects.reduce((sum, p) => sum + p.height, 0) / totalProspects;
    const averageWeight = prospects.reduce((sum, p) => sum + p.weight, 0) / totalProspects;

    const prospectsWithFortyTime = prospects.filter(p => p.fortyTime);
    const averageFortyTime = prospectsWithFortyTime.length > 0
      ? prospectsWithFortyTime.reduce((sum, p) => sum + (p.fortyTime || 0), 0) / prospectsWithFortyTime.length
      : undefined;

    const prospectsWithVerticalLeap = prospects.filter(p => p.verticalLeap);
    const averageVerticalLeap = prospectsWithVerticalLeap.length > 0
      ? prospectsWithVerticalLeap.reduce((sum, p) => sum + (p.verticalLeap || 0), 0) / prospectsWithVerticalLeap.length
      : undefined;

    const prospectsWithBenchPress = prospects.filter(p => p.benchPress !== undefined);
    const averageBenchPress = prospectsWithBenchPress.length > 0
      ? prospectsWithBenchPress.reduce((sum, p) => sum + (p.benchPress || 0), 0) / prospectsWithBenchPress.length
      : undefined;

    return {
      totalProspects,
      draftedCount: draftedProspects.data.length,
      undraftedCount: undraftedProspects.data.length,
      positionBreakdown,
      collegeBreakdown: collegeBreakdown.slice(0, 20), // Top 20 colleges
      averageHeight: Math.round(averageHeight * 100) / 100,
      averageWeight: Math.round(averageWeight * 100) / 100,
      averageFortyTime: averageFortyTime ? Math.round(averageFortyTime * 100) / 100 : undefined,
      averageVerticalLeap: averageVerticalLeap ? Math.round(averageVerticalLeap * 100) / 100 : undefined,
      averageBenchPress: averageBenchPress ? Math.round(averageBenchPress * 100) / 100 : undefined,
    };
  }

  async findDuplicateProspects(): Promise<ProspectResponseDto[]> {
    const duplicates = await this.prospectRepository.findDuplicates();
    return duplicates.map((prospect) => this.toResponseDto(prospect));
  }

  private toResponseDto(prospect: Prospect): ProspectResponseDto {
    return {
      id: prospect.id!,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      fullName: prospect.getFullName(),
      position: prospect.position,
      college: prospect.college,
      height: prospect.height,
      weight: prospect.weight,
      handSize: prospect.handSize,
      armLength: prospect.armLength,
      homeCity: prospect.homeCity,
      homeState: prospect.homeState,
      fortyTime: prospect.fortyTime,
      tenYardSplit: prospect.tenYardSplit,
      verticalLeap: prospect.verticalLeap,
      broadJump: prospect.broadJump,
      threeCone: prospect.threeCone,
      twentyYardShuttle: prospect.twentyYardShuttle,
      benchPress: prospect.benchPress,
      drafted: prospect.drafted,
      draftYear: prospect.draftYear,
      teamId: prospect.teamId,
      draftPickId: prospect.draftPickId,
      hasCompleteCombineScores: prospect.hasCompleteCombineScores(),
      athleteScore: prospect.getAthleteScore(),
      createdAt: prospect.createdAt!,
      updatedAt: prospect.updatedAt!,
    };
  }
}