import express from 'express';
import {
  getAllPlayerAwards,
  getPlayerAwardById,
  getAwardsByPlayerId,
  getAwardsByName,
  getAwardsByYear,
  createPlayerAward,
  updatePlayerAward,
  deletePlayerAward
} from '../controllers/playerAwardController';

const router = express.Router();

// GET /api/player-awards - Get all player awards
router.get('/', getAllPlayerAwards);

// GET /api/player-awards/:id - Get player award by ID
router.get('/:id', getPlayerAwardById);

// GET /api/player-awards/player/:playerId - Get awards by player ID
router.get('/player/:playerId', getAwardsByPlayerId);

// GET /api/player-awards/name/:awardName - Get awards by award name
router.get('/name/:awardName', getAwardsByName);

// GET /api/player-awards/year/:year - Get awards by year
router.get('/year/:year', getAwardsByYear);

// POST /api/player-awards - Create new player award
router.post('/', createPlayerAward);

// PUT /api/player-awards/:id - Update player award
router.put('/:id', updatePlayerAward);

// DELETE /api/player-awards/:id - Delete player award
router.delete('/:id', deletePlayerAward);

export default router;