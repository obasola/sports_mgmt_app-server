"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerTeamController_1 = require("../controllers/playerTeamController");
const router = express_1.default.Router();
// GET /api/player-teams - Get all player-team relationships
router.get('/', playerTeamController_1.getAllPlayerTeams);
// GET /api/player-teams/:id - Get player-team relationship by ID
router.get('/:id', playerTeamController_1.getPlayerTeamById);
// GET /api/player-teams/player/:playerId - Get teams by player ID
router.get('/player/:playerId', playerTeamController_1.getTeamsByPlayerId);
// GET /api/player-teams/team/:teamId - Get players by team ID
router.get('/team/:teamId', playerTeamController_1.getPlayersByTeamId);
// GET /api/player-teams/player/:playerId/current - Get current team for player
router.get('/player/:playerId/current', playerTeamController_1.getCurrentTeamByPlayerId);
// POST /api/player-teams - Create new player-team relationship
router.post('/', playerTeamController_1.createPlayerTeam);
// PUT /api/player-teams/:id - Update player-team relationship
router.put('/:id', playerTeamController_1.updatePlayerTeam);
// DELETE /api/player-teams/:id - Delete player-team relationship
router.delete('/:id', playerTeamController_1.deletePlayerTeam);
exports.default = router;
