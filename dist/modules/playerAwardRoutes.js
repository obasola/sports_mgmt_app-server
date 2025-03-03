"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerAwardController_1 = require("../controllers/playerAwardController");
const router = express_1.default.Router();
// GET /api/player-awards - Get all player awards
router.get('/', playerAwardController_1.getAllPlayerAwards);
// GET /api/player-awards/:id - Get player award by ID
router.get('/:id', playerAwardController_1.getPlayerAwardById);
// GET /api/player-awards/player/:playerId - Get awards by player ID
router.get('/player/:playerId', playerAwardController_1.getAwardsByPlayerId);
// GET /api/player-awards/name/:awardName - Get awards by award name
router.get('/name/:awardName', playerAwardController_1.getAwardsByName);
// GET /api/player-awards/year/:year - Get awards by year
router.get('/year/:year', playerAwardController_1.getAwardsByYear);
// POST /api/player-awards - Create new player award
router.post('/', playerAwardController_1.createPlayerAward);
// PUT /api/player-awards/:id - Update player award
router.put('/:id', playerAwardController_1.updatePlayerAward);
// DELETE /api/player-awards/:id - Delete player award
router.delete('/:id', playerAwardController_1.deletePlayerAward);
exports.default = router;
