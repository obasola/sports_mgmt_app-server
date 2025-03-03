import express from 'express';
import {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayersByTeamId,
  getPlayersByPosition
} from '../controllers/playerController';

const router = express.Router();

// GET /api/players - Get all players
router.get('/', getAllPlayers);

// GET /api/players/:id - Get player by ID
router.get('/:id', getPlayerById);

// POST /api/players - Create new player
router.post('/', createPlayer);

// PUT /api/players/:id - Update player
router.put('/:id', updatePlayer);

// DELETE /api/players/:id - Delete player
router.delete('/:id', deletePlayer);

// GET /api/players/team/:teamId - Get players by team ID
router.get('/team/:teamId', getPlayersByTeamId);

// GET /api/players/position/:position - Get players by position
router.get('/position/:position', getPlayersByPosition);

export default router;