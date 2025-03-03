"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const combineScoreController_1 = require("../controllers/combineScoreController");
const router = express_1.default.Router();
// GET /api/combine-scores - Get all combine scores
router.get('/', combineScoreController_1.getAllCombineScores);
// GET /api/combine-scores/:id - Get combine score by ID
router.get('/:id', combineScoreController_1.getCombineScoreById);
// GET /api/combine-scores/player/:playerId - Get combine score by player ID
router.get('/player/:playerId', combineScoreController_1.getCombineScoreByPlayerId);
// POST /api/combine-scores - Create new combine score
router.post('/', combineScoreController_1.createCombineScore);
// PUT /api/combine-scores/:id - Update combine score
router.put('/:id', combineScoreController_1.updateCombineScore);
// DELETE /api/combine-scores/:id - Delete combine score
router.delete('/:id', combineScoreController_1.deleteCombineScore);
exports.default = router;
