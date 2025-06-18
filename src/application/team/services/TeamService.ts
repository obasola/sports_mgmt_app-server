// src/application/team/services/TeamService.ts
import { ITeamRepository } from '@/domain/team/repositories/ITeamRepository';
import { Team } from '@/domain/team/entities/Team';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateTeamDto,
  UpdateTeamDto,
  TeamFiltersDto,
  TeamResponseDto,
  TeamStatsResponseDto,
} from '../dto/TeamDto';

export class TeamService {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async createTeam(dto: CreateTeamDto): Promise<TeamResponseDto> {
    // Business logic: Check if team name already exists
    const existingTeam = await this.teamRepository.findByName(dto.name);
    if (existingTeam) {
      throw new ConflictError(`Team with name "${dto.name}" already exists`);
    }

    // Business logic: Check if scheduleId is already in use
    if (dto.scheduleId) {
      const teamWithSchedule = await this.teamRepository.findByScheduleId(dto.scheduleId);
      if (teamWithSchedule) {
        throw new ConflictError(`Schedule ID ${dto.scheduleId} is already assigned to another team`);
      }
    }

    const team = Team.create({
      name: dto.name,
      city: dto.city,
      state: dto.state,
      conference: dto.conference,
      division: dto.division,
      stadium: dto.stadium,
      scheduleId: dto.scheduleId,
    });

    const savedTeam = await this.teamRepository.save(team);
    return this.toResponseDto(savedTeam);
  }

  async getTeamById(id: number): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundError('Team', id);
    }
    return this.toResponseDto(team);
  }

  async getAllTeams(
    filters?: TeamFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<TeamResponseDto>> {
    const result = await this.teamRepository.findAll(filters, pagination);
    return {
      data: result.data.map((team) => this.toResponseDto(team)),
      pagination: result.pagination,
    };
  }

  async updateTeam(id: number, dto: UpdateTeamDto): Promise<TeamResponseDto> {
    const existingTeam = await this.teamRepository.findById(id);
    if (!existingTeam) {
      throw new NotFoundError('Team', id);
    }

    // Business logic: Check name uniqueness if name is being updated
    if (dto.name && dto.name !== existingTeam.name) {
      const teamWithSameName = await this.teamRepository.findByName(dto.name);
      if (teamWithSameName && teamWithSameName.id !== id) {
        throw new ConflictError(`Team with name "${dto.name}" already exists`);
      }
    }

    // Business logic: Check scheduleId uniqueness if being updated
    if (dto.scheduleId && dto.scheduleId !== existingTeam.scheduleId) {
      const teamWithSchedule = await this.teamRepository.findByScheduleId(dto.scheduleId);
      if (teamWithSchedule && teamWithSchedule.id !== id) {
        throw new ConflictError(`Schedule ID ${dto.scheduleId} is already assigned to another team`);
      }
    }

    // Apply updates using business methods
    if (dto.name) {
      existingTeam.updateName(dto.name);
    }

    if (dto.city !== undefined || dto.state !== undefined) {
      existingTeam.updateLocation(
        dto.city ?? existingTeam.city,
        dto.state ?? existingTeam.state
      );
    }

    if (dto.stadium !== undefined) {
      existingTeam.updateStadium(dto.stadium);
    }

    if (dto.scheduleId !== undefined) {
      if (dto.scheduleId) {
        existingTeam.assignSchedule(dto.scheduleId);
      } else {
        existingTeam.removeSchedule();
      }
    }

    // Create updated team with merged properties
    const updatedTeam = Team.create({
      id: existingTeam.id,
      name: dto.name ?? existingTeam.name,
      city: dto.city ?? existingTeam.city,
      state: dto.state ?? existingTeam.state,
      conference: dto.conference ?? existingTeam.conference,
      division: dto.division ?? existingTeam.division,
      stadium: dto.stadium ?? existingTeam.stadium,
      scheduleId: dto.scheduleId ?? existingTeam.scheduleId,
    });

    const savedTeam = await this.teamRepository.update(id, updatedTeam);
    return this.toResponseDto(savedTeam);
  }

  async deleteTeam(id: number): Promise<void> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundError('Team', id);
    }

    // Business logic: Check if team can be deleted
    // In a real application, you might check for related entities
    // e.g., if team has players, prospects, draft picks, etc.

    await this.teamRepository.delete(id);
  }

  async teamExists(id: number): Promise<boolean> {
    return this.teamRepository.exists(id);
  }

  async getTeamByName(name: string): Promise<TeamResponseDto | null> {
    const team = await this.teamRepository.findByName(name);
    return team ? this.toResponseDto(team) : null;
  }

  async getTeamsByConference(conference: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findByConference(conference);
    return teams.map((team) => this.toResponseDto(team));
  }

  async getTeamsByDivision(division: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findByDivision(division);
    return teams.map((team) => this.toResponseDto(team));
  }

  async getTeamsByState(state: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findByState(state);
    return teams.map((team) => this.toResponseDto(team));
  }

  async getTeamByScheduleId(scheduleId: number): Promise<TeamResponseDto | null> {
    const team = await this.teamRepository.findByScheduleId(scheduleId);
    return team ? this.toResponseDto(team) : null;
  }

  async getTeamsWithSchedules(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findTeamsWithSchedules();
    return teams.map((team) => this.toResponseDto(team));
  }

  async getTeamsWithoutSchedules(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findTeamsWithoutSchedules();
    return teams.map((team) => this.toResponseDto(team));
  }

  async getTeamStats(): Promise<TeamStatsResponseDto> {
    const [conferenceBreakdown, divisionBreakdown, allTeams, teamsWithSchedules] = await Promise.all([
      this.teamRepository.countByConference(),
      this.teamRepository.countByDivision(),
      this.teamRepository.findAll(),
      this.teamRepository.findTeamsWithSchedules(),
    ]);

    const totalTeams = allTeams.pagination.total;
    const teamsWithStadiums = allTeams.data.filter(team => team.stadium).length;

    return {
      totalTeams,
      conferenceBreakdown,
      divisionBreakdown,
      teamsWithSchedules: teamsWithSchedules.length,
      teamsWithStadiums,
    };
  }

  private toResponseDto(team: Team): TeamResponseDto {
    const location = team.getLocation();
    
    return {
      id: team.id!,
      name: team.name,
      city: team.city,
      state: team.state,
      conference: team.conference,
      division: team.division,
      stadium: team.stadium,
      scheduleId: team.scheduleId,
      location: location?.getFormattedLocation(),
      fullName: team.getFullName(),
    };
  }
}