"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerController_1 = require("../controllers/playerController");
const router = express_1.default.Router();
// GET /api/players - Get all players
router.get('/', playerController_1.getAllPlayers);
// GET /api/players/:id - Get player by ID
router.get('/:id', playerController_1.getPlayerById);
// POST /api/players - Create new player
router.post('/', playerController_1.createPlayer);
// PUT /api/players/:id - Update player
router.put('/:id', playerController_1.updatePlayer);
// DELETE /api/players/:id - Delete player
router.delete('/:id', playerController_1.deletePlayer);
// GET /api/players/team/:teamId - Get players by team ID
router.get('/team/:teamId', playerController_1.getPlayersByTeamId);
// GET /api/players/position/:position - Get players by position
router.get('/position/:position', playerController_1.getPlayersByPosition);
exports.default = router;
