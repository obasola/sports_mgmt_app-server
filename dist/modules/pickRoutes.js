"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pickController_1 = require("../controllers/pickController");
const router = express_1.default.Router();
// GET /api/picks - Get all picks
router.get('/', pickController_1.getAllPicks);
// GET /api/picks/:id - Get pick by ID
router.get('/:id', pickController_1.getPickById);
// GET /api/picks/player/:playerId - Get picks by player ID
router.get('/player/:playerId', pickController_1.getPicksByPlayerId);
// GET /api/picks/team/:teamId - Get picks by team ID
router.get('/team/:teamId', pickController_1.getPicksByTeamId);
// GET /api/picks/year/:year - Get picks by year
router.get('/year/:year', pickController_1.getPicksByYear);
// POST /api/picks - Create new pick
router.post('/', pickController_1.createPick);
// PUT /api/picks/:id - Update pick
router.put('/:id', pickController_1.updatePick);
// DELETE /api/picks/:id - Delete pick
router.delete('/:id', pickController_1.deletePick);
exports.default = router;
