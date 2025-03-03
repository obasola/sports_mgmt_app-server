import { Request, Response } from 'express';
import { prisma } from '../server';
import { ScheduleCreateInput, ScheduleUpdateInput } from '../types';

// Get all schedules
export const getAllSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        Team_Schedule_homeTeamIdToTeam: true,
        Team_Schedule_awayTeamIdToTeam: true
      }
    });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

// Get schedule by ID
export const getScheduleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        Team_Schedule_homeTeamIdToTeam: true,
        Team_Schedule_awayTeamIdToTeam: true
      }
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error(`Error fetching schedule with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Get schedules by team ID (either home or away)
export const getSchedulesByTeamId = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [
          { homeTeamId: parseInt(teamId) },
          { awayTeamId: parseInt(teamId) }
        ]
      },
      include: {
        Team_Schedule_homeTeamIdToTeam: true,
        Team_Schedule_awayTeamIdToTeam: true
      },
      orderBy: {
        gameDate: 'asc'
      }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error(`Error fetching schedules for team ID ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch schedules for team' });
  }
};

// Get schedules by week
export const getSchedulesByWeek = async (req: Request, res: Response) => {
  const { week } = req.params;
  
  try {
    const schedules = await prisma.schedule.findMany({
      where: { scheduleWeek: parseInt(week) },
      include: {
        Team_Schedule_homeTeamIdToTeam: true,
        Team_Schedule_awayTeamIdToTeam: true
      },
      orderBy: {
        gameDate: 'asc'
      }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error(`Error fetching schedules for week ${week}:`, error);
    res.status(500).json({ error: 'Failed to fetch schedules by week' });
  }
};

// Get schedules by date range
export const getSchedulesByDateRange = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.params;
  
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        gameDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        Team_Schedule_homeTeamIdToTeam: true,
        Team_Schedule_awayTeamIdToTeam: true
      },
      orderBy: {
        gameDate: 'asc'
      }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error(`Error fetching schedules for date range ${startDate} to ${endDate}:`, error);
    res.status(500).json({ error: 'Failed to fetch schedules by date range' });
  }
};

// Create new schedule
export const createSchedule = async (req: Request, res: Response) => {
  const scheduleData: ScheduleCreateInput = req.body;
  
  try {
    const newSchedule = await prisma.schedule.create({
      data: scheduleData
    });
    
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(400).json({ error: 'Failed to create schedule' });
  }
};

// Update schedule
export const updateSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const scheduleData: ScheduleUpdateInput = req.body;
  
  try {
    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: scheduleData
    });
    
    res.json(updatedSchedule);
  } catch (error) {
    console.error(`Error updating schedule with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.status(400).json({ error: 'Failed to update schedule' });
  }
};

// Delete schedule
export const deleteSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.schedule.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting schedule with ID ${id}:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};