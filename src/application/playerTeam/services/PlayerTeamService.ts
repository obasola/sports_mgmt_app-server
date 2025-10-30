// src/application/playerteam/services/PlayerTeamService.ts
import { IPlayerTeamRepository } from '@/domain/playerTeam/repositories/IPlayerTeamRepository';
import { PlayerTeam } from '@/domain/playerTeam/entities/PlayerTeam';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreatePlayerTeamDto,
  UpdatePlayerTeamDto,
  PlayerTeamFiltersDto,
  PlayerTeamResponseDto,
} from '../dto/PlayerTeamDto';

export class PlayerTeamService {
  constructor(private readonly playerTeamRepository: IPlayerTeamRepository) {}

  async createPlayerTeam(dto: CreatePlayerTeamDto): Promise<PlayerTeamResponseDto> {
    // Business logic validation: Check if jersey number is available for the team
    if (dto.jerseyNumber && dto.teamId) {
      const isJerseyAvailable = await this.playerTeamRepository.checkJerseyNumberAvailable(
        dto.teamId,
        dto.jerseyNumber
      );
      if (!isJerseyAvailable) {
        throw new ConflictError(`Jersey number ${dto.jerseyNumber} is already taken for this team`);
      }
    }

    // Business rule: Player can only have one current team at a time
    if (dto.currentTeam !== false) {
      const currentTeam = await this.playerTeamRepository.findCurrentTeamForPlayer(dto.playerId);
      if (currentTeam) {
        throw new ConflictError('Player already has a current team assignment');
      }
    }

    const playerTeam = PlayerTeam.create({
      playerId: dto.playerId,
      teamId: dto.teamId,
      jerseyNumber: dto.jerseyNumber,
      currentTeam: dto.currentTeam,
      isActive: true,
      startYear: dto.startYear,
      endYear: dto.endYear,
      contractValue: dto.contractValue,
      contractLength: dto.contractLength,
    });

    const savedPlayerTeam = await this.playerTeamRepository.save(playerTeam);
    return this.toResponseDto(savedPlayerTeam);
  }

  async getPlayerTeamById(id: number): Promise<PlayerTeamResponseDto> {
    const playerTeam = await this.playerTeamRepository.findById(id);
    if (!playerTeam) {
      throw new NotFoundError('PlayerTeam', id);
    }
    return this.toResponseDto(playerTeam);
  }

  async getAllPlayerTeams(
    filters?: PlayerTeamFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PlayerTeamResponseDto>> {
    const result = await this.playerTeamRepository.findAll(filters, pagination);
    return {
      data: result.data.map((playerTeam) => this.toResponseDto(playerTeam)),
      pagination: result.pagination,
    };
  }

  async updatePlayerTeam(id: number, dto: UpdatePlayerTeamDto): Promise<PlayerTeamResponseDto> {
    const existingPlayerTeam = await this.playerTeamRepository.findById(id);
    if (!existingPlayerTeam) {
      throw new NotFoundError('PlayerTeam', id);
    }

    // Business logic validation: Check jersey number availability if updating
    if (dto.jerseyNumber && existingPlayerTeam.teamId) {
      const isJerseyAvailable = await this.playerTeamRepository.checkJerseyNumberAvailable(
        existingPlayerTeam.teamId,
        dto.jerseyNumber,
        id // Exclude current record
      );
      if (!isJerseyAvailable) {
        throw new ConflictError(`Jersey number ${dto.jerseyNumber} is already taken for this team`);
      }
    }

    // Business rule: If setting as current team, ensure player doesn't have another current team
    if (dto.currentTeam === true && !existingPlayerTeam.currentTeam && existingPlayerTeam.playerId) {
      const currentTeam = await this.playerTeamRepository.findCurrentTeamForPlayer(
        existingPlayerTeam.playerId
      );
      if (currentTeam && currentTeam.id !== id) {
        throw new ConflictError('Player already has a current team assignment');
      }
    }

    // Apply updates to entity
    if (dto.jerseyNumber !== undefined) {
      existingPlayerTeam.updateJerseyNumber(dto.jerseyNumber);
    }
    if (dto.currentTeam === true) {
      existingPlayerTeam.setAsCurrentTeam();
    } else if (dto.currentTeam === false) {
      existingPlayerTeam.removeAsCurrentTeam();
    }
    if (dto.endYear !== undefined) {
      existingPlayerTeam.extendContract(dto.endYear, dto.contractValue);
    }

    const updatedPlayerTeam = await this.playerTeamRepository.update(id, existingPlayerTeam);
    return this.toResponseDto(updatedPlayerTeam);
  }

  async deletePlayerTeam(id: number): Promise<void> {
    const playerTeam = await this.playerTeamRepository.findById(id);
    if (!playerTeam) {
      throw new NotFoundError('PlayerTeam', id);
    }

    await this.playerTeamRepository.delete(id);
  }

  async playerTeamExists(id: number): Promise<boolean> {
    return this.playerTeamRepository.exists(id);
  }

  // Domain-specific use cases
  async getPlayerHistory(playerId: number): Promise<PlayerTeamResponseDto[]> {
    const playerTeams = await this.playerTeamRepository.findByPlayerId(playerId);
    return playerTeams.map((playerTeam) => this.toResponseDto(playerTeam));
  }

  async getTeamRoster(teamId: number, currentOnly: boolean = false): Promise<PlayerTeamResponseDto[]> {
    let playerTeams: PlayerTeam[];
    
    if (currentOnly) {
      playerTeams = await this.playerTeamRepository.findPlayersForCurrentTeam(teamId);
    } else {
      playerTeams = await this.playerTeamRepository.findByTeamId(teamId);
    }
    
    return playerTeams.map((playerTeam) => this.toResponseDto(playerTeam));
  }

  async getCurrentTeamForPlayer(playerId: number): Promise<PlayerTeamResponseDto | null> {
    const playerTeam = await this.playerTeamRepository.findCurrentTeamForPlayer(playerId);
    return playerTeam ? this.toResponseDto(playerTeam) : null;
  }

  async getCurrentTeamContracts(): Promise<PlayerTeamResponseDto[]> {
    const playerTeams = await this.playerTeamRepository.findCurrentTeamContracts();
    return playerTeams.map((playerTeam) => this.toResponseDto(playerTeam));
  }

  async checkJerseyNumberAvailability(
    teamId: number, 
    jerseyNumber: number, 
    excludeId?: number
  ): Promise<boolean> {
    return this.playerTeamRepository.checkJerseyNumberAvailable(teamId, jerseyNumber, excludeId);
  }

  async transferPlayer(
    playerId: number, 
    newTeamId: number, 
    transferData: {
      jerseyNumber?: number;
      startYear: number;
      endYear: number;
      isActive: boolean,
      contractValue?: number;
      contractLength?: number;
    }
  ): Promise<PlayerTeamResponseDto> {
    // Remove current team assignment
    const currentTeam = await this.playerTeamRepository.findCurrentTeamForPlayer(playerId);
    if (currentTeam) {
      currentTeam.removeAsCurrentTeam();
      await this.playerTeamRepository.update(currentTeam.id!, currentTeam);
    }

    // Create new team assignment
    const transferDto: CreatePlayerTeamDto = {
      playerId,
      teamId: newTeamId,
      jerseyNumber: transferData.jerseyNumber,
      startYear: transferData.startYear,
      endYear: transferData.endYear,
      contractValue: transferData.contractValue,
      contractLength: transferData.contractLength,
      currentTeam: true,
      isActive: true,
    };

    return this.createPlayerTeam(transferDto);
  }

  private toResponseDto(playerTeam: PlayerTeam): PlayerTeamResponseDto {
    return {
      id: playerTeam.id!,
      playerId: playerTeam.playerId!,
      teamId: playerTeam.teamId!,
      jerseyNumber: playerTeam.jerseyNumber || null,
      currentTeam: playerTeam.currentTeam || false,
      isActive:playerTeam.isActive,
      startYear: playerTeam.startYear || null,
      endYear: playerTeam.endYear || null,
      contractValue: playerTeam.contractValue || null,
      contractLength: playerTeam.contractLength || null,
      isContractActive: playerTeam.isContractActive(),
      // Include relationship data if available
      player: playerTeam.player ? {
        id: playerTeam.player.id,
        firstName: playerTeam.player.firstName,
        lastName: playerTeam.player.lastName,
        position: playerTeam.player.position,
        fullName: `${playerTeam.player.firstName} ${playerTeam.player.lastName}`,
      } : null,
      team: playerTeam.team ? {
        id: playerTeam.team.id,
        name: playerTeam.team.name,
        city: playerTeam.team.city || '', // Handle optional city
        conference: playerTeam.team.conference,
        division: playerTeam.team.division,
        fullName: playerTeam.team.city ? `${playerTeam.team.city} ${playerTeam.team.name}` : playerTeam.team.name,
      } : null,
    };
  }
}