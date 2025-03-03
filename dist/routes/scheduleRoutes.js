"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scheduleController_1 = require("../controllers/scheduleController");
const router = express_1.default.Router();
// GET /api/schedules - Get all schedules
router.get('/', scheduleController_1.getAllSchedules);
// GET /api/schedules/:id - Get schedule by ID
router.get('/:id', scheduleController_1.getScheduleById);
// GET /api/schedules/team/:teamId - Get schedules by team ID
router.get('/team/:teamId', scheduleController_1.getSchedulesByTeamId);
// GET /api/schedules/week/:week - Get schedules by week
router.get('/week/:week', scheduleController_1.getSchedulesByWeek);
// GET /api/schedules/date-range/:startDate/:endDate - Get schedules by date range
router.get('/date-range/:startDate/:endDate', scheduleController_1.getSchedulesByDateRange);
// POST /api/schedules - Create new schedule
router.post('/', scheduleController_1.createSchedule);
// PUT /api/schedules/:id - Update schedule
router.put('/:id', scheduleController_1.updateSchedule);
// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', scheduleController_1.deleteSchedule);
exports.default = router;
