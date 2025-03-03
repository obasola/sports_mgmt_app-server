import express from 'express';
import {
  getAllSchedules,
  getScheduleById,
  getSchedulesByTeamId,
  getSchedulesByWeek,
  getSchedulesByDateRange,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController';

const router = express.Router();

// GET /api/schedules - Get all schedules
router.get('/', getAllSchedules);

// GET /api/schedules/:id - Get schedule by ID
router.get('/:id', getScheduleById);

// GET /api/schedules/team/:teamId - Get schedules by team ID
router.get('/team/:teamId', getSchedulesByTeamId);

// GET /api/schedules/week/:week - Get schedules by week
router.get('/week/:week', getSchedulesByWeek);

// GET /api/schedules/date-range/:startDate/:endDate - Get schedules by date range
router.get('/date-range/:startDate/:endDate', getSchedulesByDateRange);

// POST /api/schedules - Create new schedule
router.post('/', createSchedule);

// PUT /api/schedules/:id - Update schedule
router.put('/:id', updateSchedule);

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', deleteSchedule);

export default router;