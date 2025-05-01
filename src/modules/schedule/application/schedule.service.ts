// src/modules/schedule/application/schedule.service.ts

import { ScheduleRepository } from '../domain/schedule.repository';
import { ScheduleDTO, CreateScheduleDTO, UpdateScheduleDTO } from './dtos/schedule.dto';
import { ScheduleProps } from '../domain/interface/schedule.props';
import { createSchedulePropsFromDTO } from '../util/schedule.mapper';
import { Schedule } from '../domain/schedule.entity';
export class ScheduleService {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async getAllSchedules(): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.findAll();
    const scheduleDTOs: ScheduleDTO[] = schedules.map(
      schedule => schedule.toObject() as ScheduleDTO,
    );
    return scheduleDTOs;
  }

  async getScheduleById(id: number): Promise<ScheduleDTO | null> {
    const schedule = await this.scheduleRepository.findById(id);
    return schedule ? (schedule.toObject() as ScheduleDTO) : null;
  }

  async getSchedulesByTeamId(teamId: number): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.findByTeamId(teamId);
    return schedules.map(schedule => schedule.toObject() as ScheduleDTO);
  }

  async getSchedulesByTeamAndSeason(teamId: number, seasonYear: string): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.findByTeamAndSeason(teamId, seasonYear);
    return schedules.map(schedule => schedule.toObject() as ScheduleDTO);
  }

  async getSchedulesByWeek(seasonYear: string, week: number): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.findByWeek(seasonYear, week);
    return schedules.map(schedule => schedule.toObject() as ScheduleDTO);
  }

  async getSchedulesByDate(date: Date): Promise<ScheduleDTO[]> {
    const schedules = await this.scheduleRepository.findByDate(date);
    return schedules.map(schedule => schedule.toObject() as ScheduleDTO);
  }

  async createSchedule(dto: CreateScheduleDTO): Promise<ScheduleDTO> {
    // Use the utility function to create props
    const scheduleProps = createSchedulePropsFromDTO(dto);

    // Create the domain entity
    const schedule = Schedule.create(scheduleProps);

    // Save it
    const createdSchedule = await this.scheduleRepository.create(schedule);

    // Return as DTO
    return createdSchedule.toObject() as ScheduleDTO;
  }

  async updateSchedule(id: number, dto: UpdateScheduleDTO): Promise<ScheduleDTO | null> {
    // First check if the schedule exists
    const existingSchedule = await this.scheduleRepository.findById(id);
    if (!existingSchedule) throw new Error(`Schedule with ID ${id} not found`);

    // Create props with existing values as base, but updated with dto values
    const updatedProps = createSchedulePropsFromDTO(
      {
        ...existingSchedule.toObject(),
        ...dto,
      },
      id,
    ); // Pass the existing ID

    // Create updated entity
    const schedule = Schedule.create(updatedProps);

    // Save it
    const updatedSchedule = await this.scheduleRepository.update(schedule);

    // Return as DTO
    return updatedSchedule.toObject() as ScheduleDTO;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return await this.scheduleRepository.delete(id);
  }

  // Additional business logic methods
  async getTeamRecord(
    teamId: number,
    seasonYear: string,
  ): Promise<{ wins: number; losses: number }> {
    const schedules = await this.scheduleRepository.findByTeamAndSeason(teamId, seasonYear);

    let wins = 0;
    let losses = 0;

    schedules.forEach(schedule => {
      if (schedule.wonLostFlag === 'W') {
        wins++;
      } else if (schedule.wonLostFlag === 'L') {
        losses++;
      }
    });

    return { wins, losses };
  }
}
