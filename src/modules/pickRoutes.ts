import express from 'express';
import {
  getAllPicks,
  getPickById,
  getPicksByPlayerId,
  getPicksByTeamId,
  getPicksByYear,
  createPick,
  updatePick,
  deletePick
} from '../controllers/pickController';

const router = express.Router();

// GET /api/picks - Get all picks
router.get('/', getAllPicks);

// GET /api/picks/:id - Get pick by ID
router.get('/:id', getPickById);

// GET /api/picks/player/:playerId - Get picks by player ID
router.get('/player/:playerId', getPicksByPlayerId);

// GET /api/picks/team/:teamId - Get picks by team ID
router.get('/team/:teamId', getPicksByTeamId);

// GET /api/picks/year/:year - Get picks by year
router.get('/year/:year', getPicksByYear);

// POST /api/picks - Create new pick
router.post('/', createPick);

// PUT /api/picks/:id - Update pick
router.put('/:id', updatePick);

// DELETE /api/picks/:id - Delete pick
router.delete('/:id', deletePick);

export default router;