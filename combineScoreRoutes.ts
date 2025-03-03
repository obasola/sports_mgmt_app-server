import express from 'express';
import {
  getAllCombineScores,
  getCombineScoreById,
  getCombineScoreByPlayerId,
  createCombineScore,
  updateCombineScore,
  deleteCombineScore
} from '../controllers/combineScoreController';

const router = express.Router();

// GET /api/combine-scores - Get all combine scores
router.get('/', getAllCombineScores);

// GET /api/combine-scores/:id - Get combine score by ID
router.get('/:id', getCombineScoreById);

// GET /api/combine-scores/player/:playerId - Get combine score by player ID
router.get('/player/:playerId', getCombineScoreByPlayerId);

// POST /api/combine-scores - Create new combine score
router.post('/', createCombineScore);

// PUT /api/combine-scores/:id - Update combine score
router.put('/:id', updateCombineScore);

// DELETE /api/combine-scores/:id - Delete combine score
router.delete('/:id', deleteCombineScore);

export default router;