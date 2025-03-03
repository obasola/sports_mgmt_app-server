import express from 'express';
import {
  getAllPlayerTeams,
  getPlayerTeamById,
  getTeamsByPlayerId,
  getPlayersByTeamId,
  getCurrentTeamByPlayerId,
  createPlayerTeam,
  updatePlayerTeam,
  deletePlayerTeam
} from '../controllers/playerTeamController';

const router = express.Router();

// GET /api/player-teams - Get all player-team relationships
router.get('/', getAllPlayerTeams);

// GET /api/player-teams/:id - Get player-team relationship by ID
router.get('/:id', getPlayerTeamById);

// GET /api/player-teams/player/:playerId - Get teams by player ID
router.get('/player/:playerId', getTeamsByPlayerId);

// GET /api/player-teams/team/:teamId - Get players by team ID
router.get('/team/:teamId', getPlayersByTeamId);

// GET /api/player-teams/player/:playerId/current - Get current team for player
router.get('/player/:playerId/current', getCurrentTeamByPlayerId);

// POST /api/player-teams - Create new player-team relationship
router.post('/', createPlayerTeam);

// PUT /api/player-teams/:id - Update player-team relationship
router.put('/:id', updatePlayerTeam);

// DELETE /api/player-teams/:id - Delete player-team relationship
router.delete('/:id', deletePlayerTeam);

export default router;