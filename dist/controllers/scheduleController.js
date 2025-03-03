"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.createSchedule = exports.getSchedulesByDateRange = exports.getSchedulesByWeek = exports.getSchedulesByTeamId = exports.getScheduleById = exports.getAllSchedules = void 0;
const server_1 = require("../server");
// Get all schedules
const getAllSchedules = async (req, res) => {
    try {
        const schedules = await server_1.prisma.schedule.findMany({
            include: {
                Team_Schedule_homeTeamIdToTeam: true,
                Team_Schedule_awayTeamIdToTeam: true
            }
        });
        res.json(schedules);
    }
    catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};
exports.getAllSchedules = getAllSchedules;
// Get schedule by ID
const getScheduleById = async (req, res) => {
    const { id } = req.params;
    try {
        const schedule = await server_1.prisma.schedule.findUnique({
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
    }
    catch (error) {
        console.error(`Error fetching schedule with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
};
exports.getScheduleById = getScheduleById;
// Get schedules by team ID (either home or away)
const getSchedulesByTeamId = async (req, res) => {
    const { teamId } = req.params;
    try {
        const schedules = await server_1.prisma.schedule.findMany({
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
    }
    catch (error) {
        console.error(`Error fetching schedules for team ID ${teamId}:`, error);
        res.status(500).json({ error: 'Failed to fetch schedules for team' });
    }
};
exports.getSchedulesByTeamId = getSchedulesByTeamId;
// Get schedules by week
const getSchedulesByWeek = async (req, res) => {
    const { week } = req.params;
    try {
        const schedules = await server_1.prisma.schedule.findMany({
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
    }
    catch (error) {
        console.error(`Error fetching schedules for week ${week}:`, error);
        res.status(500).json({ error: 'Failed to fetch schedules by week' });
    }
};
exports.getSchedulesByWeek = getSchedulesByWeek;
// Get schedules by date range
const getSchedulesByDateRange = async (req, res) => {
    const { startDate, endDate } = req.params;
    try {
        const schedules = await server_1.prisma.schedule.findMany({
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
    }
    catch (error) {
        console.error(`Error fetching schedules for date range ${startDate} to ${endDate}:`, error);
        res.status(500).json({ error: 'Failed to fetch schedules by date range' });
    }
};
exports.getSchedulesByDateRange = getSchedulesByDateRange;
// Create new schedule
const createSchedule = async (req, res) => {
    const scheduleData = req.body;
    try {
        const newSchedule = await server_1.prisma.schedule.create({
            data: scheduleData
        });
        res.status(201).json(newSchedule);
    }
    catch (error) {
        console.error('Error creating schedule:', error);
        res.status(400).json({ error: 'Failed to create schedule' });
    }
};
exports.createSchedule = createSchedule;
// Update schedule
const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const scheduleData = req.body;
    try {
        const updatedSchedule = await server_1.prisma.schedule.update({
            where: { id: parseInt(id) },
            data: scheduleData
        });
        res.json(updatedSchedule);
    }
    catch (error) {
        console.error(`Error updating schedule with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.status(400).json({ error: 'Failed to update schedule' });
    }
};
exports.updateSchedule = updateSchedule;
// Delete schedule
const deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        await server_1.prisma.schedule.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting schedule with ID ${id}:`, error);
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
};
exports.deleteSchedule = deleteSchedule;
