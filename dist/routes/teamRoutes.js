"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController_1 = require("../controllers/teamController");
const router = express_1.default.Router();
// GET /api/teams - Get all teams
router.get('/', teamController_1.getAllTeams);
// GET /api/teams/:id - Get team by ID
router.get('/:id', teamController_1.getTeamById);
// POST /api/teams - Create new team
router.post('/', teamController_1.createTeam);
// PUT /api/teams/:id - Update team
router.put('/:id', teamController_1.updateTeam);
// DELETE /api/teams/:id - Delete team
router.delete('/:id', teamController_1.deleteTeam);
// GET /api/teams/conference/:conference - Get teams by conference
router.get('/conference/:conference', teamController_1.getTeamsByConference);
// GET /api/teams/division/:division - Get teams by division
router.get('/division/:division', teamController_1.getTeamsByDivision);
exports.default = router;
