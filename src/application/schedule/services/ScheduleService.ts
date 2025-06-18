
// src/application/schedule/services/ScheduleService.ts
import { IScheduleRepository } from '@/domain/schedule/repositories/IScheduleRepository';
import { Schedule } from '@/domain/schedule/entities/Schedule';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleFiltersDto,
  ScheduleResponseDto,
} from '../dto/ScheduleDto';

export class ScheduleService {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}

  async createSchedule(dto: CreateScheduleDto): Promise<ScheduleResponseDto> {
    // Business logic: Validate that the team doesn't play itself
    if (dto.teamId && dto.teamId === dto.oppTeamId) {
      throw new ConflictError('A team cannot play against itself');
    }

    // Business logic: Validate game date is not in the past for new games
    if (dto.gameDate && dto.gameDate < new Date()) {
      throw new ConflictError('Cannot schedule games in the past');
    }

    const schedule = Schedule.create({
      teamId: dto.teamId,
      seasonYear: dto.seasonYear,
      oppTeamId: dto.oppTeamId,
      oppTeamConference: dto.oppTeamConference,
      oppTeamDivision: dto.oppTeamDivision,
      scheduleWeek: dto.scheduleWeek,
      gameDate: dto.gameDate,
      gameCity: dto.gameCity,
      gameStateProvince: dto.gameStateProvince,
      gameCountry: dto.gameCountry,
      gameLocation: dto.gameLocation,
      wonLostFlag: dto.wonLostFlag,
      homeOrAway: dto.homeOrAway,
      oppTeamScore: dto.oppTeamScore,
      teamScore: dto.teamScore,
    });

    const savedSchedule = await this.scheduleRepository.save(schedule);
    return this.toResponseDto(savedSchedule);
  }

  async getScheduleById(id: number): Promise<ScheduleResponseDto> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Schedule', id);
    }
    return this.toResponseDto(schedule);
  }

  async getAllSchedules(
    filters?: ScheduleFiltersDto,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<ScheduleResponseDto>> {
    const result = await this.scheduleRepository.findAll(filters, pagination);
    return {
      data: result.data.map((schedule) => this.toResponseDto(schedule)),
      pagination: result.pagination,
    };
  }

  async updateSchedule(id: number, dto: UpdateScheduleDto): Promise<ScheduleResponseDto> {
    const existingSchedule = await this.scheduleRepository.findById(id);
    if (!existingSchedule) {
      throw new NotFoundError('Schedule', id);
    }

    // Business logic: Validate that the team doesn't play itself
    if (dto.teamId && dto.oppTeamId && dto.teamId === dto.oppTeamId) {
      throw new ConflictError('A team cannot play against itself');
    }

    // Apply updates to the existing schedule
    const updatedProps = {
      id: existingSchedule.id,
      teamId: dto.teamId ?? existingSchedule.teamId,
      seasonYear: dto.seasonYear ?? existingSchedule.seasonYear,
      oppTeamId: dto.oppTeamId ?? existingSchedule.oppTeamId,
      oppTeamConference: dto.oppTeamConference ?? existingSchedule.oppTeamConference,
      oppTeamDivision: dto.oppTeamDivision ?? existingSchedule.oppTeamDivision,
      scheduleWeek: dto.scheduleWeek ?? existingSchedule.scheduleWeek,
      gameDate: dto.gameDate ?? existingSchedule.gameDate,
      gameCity: dto.gameCity ?? existingSchedule.gameCity,
      gameStateProvince: dto.gameStateProvince ?? existingSchedule.gameStateProvince,
      gameCountry: dto.gameCountry ?? existingSchedule.gameCountry,
      gameLocation: dto.gameLocation ?? existingSchedule.gameLocation,
      wonLostFlag: dto.wonLostFlag ?? existingSchedule.wonLostFlag,
      homeOrAway: dto.homeOrAway ?? existingSchedule.homeOrAway,
      oppTeamScore: dto.oppTeamScore ?? existingSchedule.oppTeamScore,
      teamScore: dto.teamScore ?? existingSchedule.teamScore,
    };

    const schedule = Schedule.create(updatedProps);
    const updatedSchedule = await this.scheduleRepository.update(id, schedule);
    return this.toResponseDto(updatedSchedule);
  }

  async deleteSchedule(id: number): Promise<void> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Schedule', id);
    }

    await this.scheduleRepository.delete(id);
  }

  async scheduleExists(id: number): Promise<boolean> {
    return this.scheduleRepository.exists(id);
  }

  async getTeamSchedule(teamId: number, seasonYear: number): Promise<ScheduleResponseDto[]> {
    const schedules = await this.scheduleRepository.findByTeamAndSeason(teamId, seasonYear);
    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async getOpponentHistory(oppTeamId: number): Promise<ScheduleResponseDto[]> {
    const schedules = await this.scheduleRepository.findByOpponentTeam(oppTeamId);
    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async getUpcomingGames(teamId?: number): Promise<ScheduleResponseDto[]> {
    const schedules = await this.scheduleRepository.findUpcomingGames(teamId);
    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async getCompletedGames(teamId?: number): Promise<ScheduleResponseDto[]> {
    const schedules = await this.scheduleRepository.findCompletedGames(teamId);
    return schedules.map((schedule) => this.toResponseDto(schedule));
  }

  async updateGameResult(
    id: number,
    teamScore: number,
    oppTeamScore: number,
    wonLostFlag: string
  ): Promise<ScheduleResponseDto> {
    const existingSchedule = await this.scheduleRepository.findById(id);
    if (!existingSchedule) {
      throw new NotFoundError('Schedule', id);
    }

    // Use domain method to update game result
    existingSchedule.updateGameResult(teamScore, oppTeamScore, wonLostFlag);

    const updatedSchedule = await this.scheduleRepository.update(id, existingSchedule);
    return this.toResponseDto(updatedSchedule);
  }

  private toResponseDto(schedule: Schedule): ScheduleResponseDto {
    const gameLocation = this.buildFullGameLocation(schedule);
    
    return {
      id: schedule.id!,
      teamId: schedule.teamId,
      seasonYear: schedule.seasonYear,
      oppTeamId: schedule.oppTeamId,
      oppTeamConference: schedule.oppTeamConference,
      oppTeamDivision: schedule.oppTeamDivision,
      scheduleWeek: schedule.scheduleWeek,
      gameDate: schedule.gameDate?.toISOString(),
      gameCity: schedule.gameCity,
      gameStateProvince: schedule.gameStateProvince,
      gameCountry: schedule.gameCountry,
      gameLocation: schedule.gameLocation,
      wonLostFlag: schedule.wonLostFlag,
      homeOrAway: schedule.homeOrAway,
      oppTeamScore: schedule.oppTeamScore,
      teamScore: schedule.teamScore,
      gameCompleted: schedule.isGameCompleted(),
      gameResult: schedule.isGameCompleted() ? schedule.getGameResultSummary() : undefined,
      isHomeGame: schedule.isHomeGame(),
      fullGameLocation: gameLocation,
    };
  }

  private buildFullGameLocation(schedule: Schedule): string {
    const parts: string[] = [];
    
    if (schedule.gameLocation) parts.push(schedule.gameLocation);
    if (schedule.gameCity) parts.push(schedule.gameCity);
    if (schedule.gameStateProvince) parts.push(schedule.gameStateProvince);
    if (schedule.gameCountry) parts.push(schedule.gameCountry);
    
    return parts.length > 0 ? parts.join(', ') : 'Location TBD';
  }
}
