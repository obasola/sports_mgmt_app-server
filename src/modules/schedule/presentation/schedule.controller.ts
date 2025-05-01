// src/modules/schedule/presentation/schedule.controller.ts
import { Request, Response } from 'express';
import { ScheduleService } from '../application/schedule.service';
import { CreateScheduleDTO, UpdateScheduleDTO } from '../application/dtos/schedule.dto';

export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  async getAllSchedules(req: Request, res: Response): Promise<void> {
    try {
      const schedules = await this.scheduleService.getAllSchedules();
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
  }

  async getScheduleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const schedule = await this.scheduleService.getScheduleById(id);

      if (!schedule) {
        res.status(404).json({ message: 'Schedule not found' });
        return;
      }

      res.status(200).json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedule', error });
    }
  }

  async getSchedulesByTeamId(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const schedules = await this.scheduleService.getSchedulesByTeamId(teamId);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
  }

  async getSchedulesByTeamAndSeason(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonYear = req.params.seasonYear;
      const schedules = await this.scheduleService.getSchedulesByTeamAndSeason(teamId, seasonYear);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
  }

  async getSchedulesByWeek(req: Request, res: Response): Promise<void> {
    try {
      const seasonYear = req.params.seasonYear;
      const week = parseInt(req.params.week);
      const schedules = await this.scheduleService.getSchedulesByWeek(seasonYear, week);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
  }

  async getSchedulesByDate(req: Request, res: Response): Promise<void> {
    try {
      const dateString = req.params.date;
      const date = new Date(dateString);
      const schedules = await this.scheduleService.getSchedulesByDate(date);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
  }

  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateScheduleDTO = req.body;

      // Handle date conversion from string to Date object if needed
      if (dto.gameDate && typeof dto.gameDate === 'string') {
        dto.gameDate = new Date(dto.gameDate);
      }

      const schedule = await this.scheduleService.createSchedule(dto);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Error creating schedule', error });
    }
  }

  async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdateScheduleDTO = req.body;

      // Handle date conversion from string to Date object if needed
      if (dto.gameDate && typeof dto.gameDate === 'string') {
        dto.gameDate = new Date(dto.gameDate);
      }

      const schedule = await this.scheduleService.updateSchedule(id, dto);

      if (!schedule) {
        res.status(404).json({ message: 'Schedule not found' });
        return;
      }

      res.status(200).json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Error updating schedule', error });
    }
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.scheduleService.deleteSchedule(id);

      if (!result) {
        res.status(404).json({ message: 'Schedule not found' });
        return;
      }

      res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting schedule', error });
    }
  }

  async getTeamRecord(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const seasonYear = req.params.seasonYear;
      const record = await this.scheduleService.getTeamRecord(teamId, seasonYear);
      res.status(200).json(record);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching team record', error });
    }
  }
}
