// src/application/draftpick/services/DraftPickService.ts
import { IDraftPickRepository } from '@/domain/draftpick/repositories/IDraftPickRepository';
import { DraftPick } from '@/domain/draftpick/entities/DraftPick';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateDraftPickDto,
  UpdateDraftPickDto,
  UseDraftPickDto,
  AssignPlayerDto,
  TradeDraftPickDto,
  DraftPickFiltersDto,
  DraftPickResponseDto,
  BulkCreateDraftPicksDto,
  DraftPickSummaryDto,
  DraftYearStatsDto,
} from '../dto/DraftPickDto';

export class DraftPickService {
  constructor(private readonly draftPickRepository: IDraftPickRepository) {}

  async createDraftPick(dto: CreateDraftPickDto): Promise<DraftPickResponseDto> {
    // Business validation: Check if pick number is already taken
    const isPickTaken = await this.draftPickRepository.isPickNumberTaken(dto.pickNumber, dto.draftYear);
    if (isPickTaken) {
      throw new ConflictError(`Pick number ${dto.pickNumber} for ${dto.draftYear} is already taken`);
    }

    // Business validation: Validate round vs pick number consistency
    this.validateRoundPickConsistency(dto.round, dto.pickNumber);

    const draftPick = DraftPick.create({
      round: dto.round,
      pickNumber: dto.pickNumber,
      draftYear: dto.draftYear,
      currentTeamId: dto.currentTeamId,
      prospectId: dto.prospectId,
      playerId: dto.playerId,
      used: dto.used || false,
      originalTeam: dto.originalTeam,
    });

    const savedDraftPick = await this.draftPickRepository.save(draftPick);
    return this.toResponseDto(savedDraftPick);
  }

  async bulkCreateDraftPicks(dto: BulkCreateDraftPicksDto): Promise<DraftPickResponseDto[]> {
    const { draftYear, rounds, picksPerRound, teams } = dto;

    // Validate that draft year doesn't already exist
    const existingPicks = await this.draftPickRepository.findByDraftYear(draftYear);
    if (existingPicks.length > 0) {
      throw new ConflictError(`Draft picks for year ${draftYear} already exist`);
    }

    const draftPicks: DraftPick[] = [];
    let pickNumber = 1;

    // Create picks for each round
    for (let round = 1; round <= rounds; round++) {
      // For each team in the round
      for (let teamIndex = 0; teamIndex < Math.min(teams.length, picksPerRound); teamIndex++) {
        const teamId = teams[teamIndex];
        
        const draftPick = DraftPick.create({
          round,
          pickNumber,
          draftYear,
          currentTeamId: teamId,
          used: false,
        });

        draftPicks.push(draftPick);
        pickNumber++;
      }
    }

    // Save all picks
    const savedPicks: DraftPick[] = [];
    for (const pick of draftPicks) {
      const saved = await this.draftPickRepository.save(pick);
      savedPicks.push(saved);
    }

    return savedPicks.map(pick => this.toResponseDto(pick));
  }

  async getDraftPickById(id: number): Promise<DraftPickResponseDto> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }
    return this.toResponseDto(draftPick);
  }

  async getAllDraftPicks(
    filters?: DraftPickFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DraftPickResponseDto>> {
    const result = await this.draftPickRepository.findAll(filters, pagination);
    return {
      data: result.data.map((draftPick) => this.toResponseDto(draftPick)),
      pagination: result.pagination,
    };
  }

  async updateDraftPick(id: number, dto: UpdateDraftPickDto): Promise<DraftPickResponseDto> {
    const existingDraftPick = await this.draftPickRepository.findById(id);
    if (!existingDraftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    // Create updated draft pick entity
    const updatedDraftPick = DraftPick.create({
      id: existingDraftPick.id,
      round: existingDraftPick.round, // Cannot change
      pickNumber: existingDraftPick.pickNumber, // Cannot change
      draftYear: existingDraftPick.draftYear, // Cannot change
      currentTeamId: dto.currentTeamId ?? existingDraftPick.currentTeamId,
      prospectId: dto.prospectId ?? existingDraftPick.prospectId,
      playerId: dto.playerId ?? existingDraftPick.playerId,
      used: dto.used ?? existingDraftPick.used,
      originalTeam: dto.originalTeam ?? existingDraftPick.originalTeam,
      createdAt: existingDraftPick.createdAt,
      updatedAt: new Date(),
    });

    const savedDraftPick = await this.draftPickRepository.update(id, updatedDraftPick);
    return this.toResponseDto(savedDraftPick);
  }

  async deleteDraftPick(id: number): Promise<void> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    // Business rule: Cannot delete used picks
    if (draftPick.used) {
      throw new ValidationError('Cannot delete a used draft pick');
    }

    await this.draftPickRepository.delete(id);
  }

  async useDraftPick(id: number, dto: UseDraftPickDto): Promise<DraftPickResponseDto> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    // Business validation: Check if prospect is already drafted
    const existingPickForProspect = await this.draftPickRepository.findByProspect(dto.prospectId);
    if (existingPickForProspect && existingPickForProspect.id !== id) {
      throw new ConflictError(`Prospect ${dto.prospectId} is already drafted`);
    }

    draftPick.usePick(dto.prospectId);
    const updatedPick = await this.draftPickRepository.update(id, draftPick);
    return this.toResponseDto(updatedPick);
  }

  async assignPlayerToDraftPick(id: number, dto: AssignPlayerDto): Promise<DraftPickResponseDto> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    // Business validation: Check if player is already assigned to another pick
    const existingPickForPlayer = await this.draftPickRepository.findByPlayer(dto.playerId);
    if (existingPickForPlayer && existingPickForPlayer.id !== id) {
      throw new ConflictError(`Player ${dto.playerId} is already assigned to another draft pick`);
    }

    draftPick.assignPlayer(dto.playerId);
    const updatedPick = await this.draftPickRepository.update(id, draftPick);
    return this.toResponseDto(updatedPick);
  }

  async tradeDraftPick(id: number, dto: TradeDraftPickDto): Promise<DraftPickResponseDto> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    draftPick.tradeTo(dto.newTeamId);
    const updatedPick = await this.draftPickRepository.update(id, draftPick);
    return this.toResponseDto(updatedPick);
  }

  async resetDraftPick(id: number): Promise<DraftPickResponseDto> {
    const draftPick = await this.draftPickRepository.findById(id);
    if (!draftPick) {
      throw new NotFoundError('DraftPick', id);
    }

    draftPick.resetPick();
    const updatedPick = await this.draftPickRepository.update(id, draftPick);
    return this.toResponseDto(updatedPick);
  }

  async getDraftPicksByTeam(teamId: number, draftYear?: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findByTeam(teamId, draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getDraftPicksByRound(round: number, draftYear: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findByRound(round, draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getDraftPicksByYear(draftYear: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findByDraftYear(draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getUnusedDraftPicks(teamId?: number, draftYear?: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findUnusedPicks(teamId, draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getUsedDraftPicks(teamId?: number, draftYear?: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findUsedPicks(teamId, draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getTradedDraftPicks(draftYear?: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findTradedPicks(draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getFirstRoundPicks(draftYear: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findFirstRoundPicks(draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getCompensatoryPicks(draftYear: number): Promise<DraftPickResponseDto[]> {
    const draftPicks = await this.draftPickRepository.findCompensatoryPicks(draftYear);
    return draftPicks.map(pick => this.toResponseDto(pick));
  }

  async getDraftYearSummary(draftYear: number): Promise<DraftPickSummaryDto> {
    const allPicks = await this.draftPickRepository.findByDraftYear(draftYear);
    
    const summary: DraftPickSummaryDto = {
      totalPicks: allPicks.length,
      usedPicks: allPicks.filter(p => p.used).length,
      unusedPicks: allPicks.filter(p => !p.used).length,
      tradedPicks: allPicks.filter(p => p.originalTeam !== undefined).length,
      firstRoundPicks: allPicks.filter(p => p.round === 1).length,
      compensatoryPicks: allPicks.filter(p => p.isCompensatoryPick()).length,
      picksByRound: this.groupPicksByRound(allPicks),
      picksByTeam: this.groupPicksByTeam(allPicks),
    };

    return summary;
  }

  async getDraftYearStats(draftYear: number): Promise<DraftYearStatsDto> {
    const summary = await this.getDraftYearSummary(draftYear);
    const allPicks = await this.draftPickRepository.findByDraftYear(draftYear);
    
    const maxRound = Math.max(...allPicks.map(p => p.round));
    const totalPickValue = allPicks.reduce((sum, pick) => sum + pick.getPickValue(), 0);
    const averagePickValue = allPicks.length > 0 ? totalPickValue / allPicks.length : 0;

    const uniqueTeams = new Set(allPicks.map(p => p.currentTeamId));

    return {
      draftYear,
      totalPicks: summary.totalPicks,
      totalTeams: uniqueTeams.size,
      roundsCompleted: maxRound,
      picksUsed: summary.usedPicks,
      picksRemaining: summary.unusedPicks,
      tradedPicks: summary.tradedPicks,
      compensatoryPicks: summary.compensatoryPicks,
      averagePickValue: Math.round(averagePickValue),
      summary,
    };
  }

  async draftPickExists(id: number): Promise<boolean> {
    return this.draftPickRepository.exists(id);
  }

  async getNextAvailablePickNumber(round: number, draftYear: number): Promise<number> {
    return this.draftPickRepository.getNextAvailablePickNumber(round, draftYear);
  }

  private validateRoundPickConsistency(round: number, pickNumber: number): void {
    const minPickForRound = (round - 1) * 32 + 1;
    const maxPickForRound = round * 32;

    // Allow some flexibility for compensatory picks
    const allowedMaxPick = maxPickForRound + 10;

    if (pickNumber < minPickForRound || pickNumber > allowedMaxPick) {
      throw new ValidationError(
        `Pick number ${pickNumber} is not valid for round ${round}. Expected range: ${minPickForRound}-${allowedMaxPick}`
      );
    }
  }

  private groupPicksByRound(picks: DraftPick[]): Array<{
    round: number;
    count: number;
    used: number;
    unused: number;
  }> {
    const roundGroups = new Map<number, DraftPick[]>();
    
    picks.forEach(pick => {
      if (!roundGroups.has(pick.round)) {
        roundGroups.set(pick.round, []);
      }
      roundGroups.get(pick.round)!.push(pick);
    });

    return Array.from(roundGroups.entries()).map(([round, roundPicks]) => ({
      round,
      count: roundPicks.length,
      used: roundPicks.filter(p => p.used).length,
      unused: roundPicks.filter(p => !p.used).length,
    })).sort((a, b) => a.round - b.round);
  }

  private groupPicksByTeam(picks: DraftPick[]): Array<{
    teamId: number;
    teamName?: string;
    count: number;
    used: number;
    unused: number;
  }> {
    const teamGroups = new Map<number, DraftPick[]>();
    
    picks.forEach(pick => {
      if (!teamGroups.has(pick.currentTeamId)) {
        teamGroups.set(pick.currentTeamId, []);
      }
      teamGroups.get(pick.currentTeamId)!.push(pick);
    });

    return Array.from(teamGroups.entries()).map(([teamId, teamPicks]) => ({
      teamId,
      count: teamPicks.length,
      used: teamPicks.filter(p => p.used).length,
      unused: teamPicks.filter(p => !p.used).length,
    })).sort((a, b) => a.teamId - b.teamId);
  }

  private toResponseDto(draftPick: DraftPick): DraftPickResponseDto {
    return {
      id: draftPick.id!,
      round: draftPick.round,
      pickNumber: draftPick.pickNumber,
      draftYear: draftPick.draftYear,
      currentTeamId: draftPick.currentTeamId,
      prospectId: draftPick.prospectId,
      playerId: draftPick.playerId,
      used: draftPick.used,
      originalTeam: draftPick.originalTeam,
      pickValue: draftPick.getPickValue(),
      pickDescription: draftPick.getPickDescription(),
      isFirstRoundPick: draftPick.isFirstRoundPick(),
      isCompensatoryPick: draftPick.isCompensatoryPick(),
      isTraded: draftPick.originalTeam !== undefined,
      createdAt: draftPick.createdAt || new Date(),
      updatedAt: draftPick.updatedAt || new Date(),
    };
  }
}