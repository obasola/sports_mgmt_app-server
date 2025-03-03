import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamsByConference,
  getTeamsByDivision
} from '../controllers/teamController';

const router = express.Router();

// GET /api/teams - Get all teams
router.get('/', getAllTeams);

// GET /api/teams/:id - Get team by ID
router.get('/:id', getTeamById);

// POST /api/teams - Create new team
router.post('/', createTeam);

// PUT /api/teams/:id - Update team
router.put('/:id', updateTeam);

// DELETE /api/teams/:id - Delete team
router.delete('/:id', deleteTeam);

// GET /api/teams/conference/:conference - Get teams by conference
router.get('/conference/:conference', getTeamsByConference);

// GET /api/teams/division/:division - Get teams by division
router.get('/division/:division', getTeamsByDivision);

export default router;