// src/presentation/routes/index.ts
import { Router } from 'express';
import { teamRoutes } from './teamRoutes';
import { personRoutes } from './personRoutes';
import { playerRoutes } from './playerRoutes';
import { playerAwardRoutes } from './playerAwardRoutes';
import { combineScoreRoutes } from './combineScoreRoutes';
import { prospectRoutes } from './prospectRoutes';
import { draftpickRoutes } from './draftPickRoutes';
import { scheduleRoutes } from './scheduleRoutes';
import { teamNeedRoutes } from './TeamNeedRoutes';
import { playerTeamRoutes } from './PlayerTeamRoutes';
import { postSeasonResultRoutes } from './PostSeasonResultRoutes';
import { gameRoutes } from './gameRoutes';

const router = Router();

// Register all domain routes
router.use('/combine-scores', combineScoreRoutes);
router.use('/draft-picks', draftpickRoutes);
router.use('/games', gameRoutes);
router.use('/persons', personRoutes);
router.use('/players', playerRoutes);
router.use('/player-awards', playerAwardRoutes);
router.use('/player-teams', playerTeamRoutes);
router.use('/prospects', prospectRoutes);
router.use('/postseason-results', postSeasonResultRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/teams', teamRoutes);
router.use('/team-needs', teamNeedRoutes);

// Future routes (uncomment as you build them)
// 

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Management API v1 is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      combineScores: '/api/combine-scores',
      draftPicks: '/api/draft-picks',
      persons: '/api/persons',
      players: '/api/players',
      playerAwards: '/api/player-awards',
      playerTeams: '/api/player-teams',            
      postSeason: '/api/postseason-results',
      prospects: '/api/prospects',
      schedules: '/api/schedules',
      teams: '/api/teams',
      teamNeeds: '/api/teamNeeds',
      // Add other endpoints as you build them
    },
  });
});

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Management API v1',
    version: '1.0.0',
    availableEndpoints: {
      teamNeeds: {
        base: '/api/teamNeeds',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team needs',
      },
      games: {
        base: '/api/games',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team games',
      },
      teams: {
        base: '/api/teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports teams',
      },
      prospect: {
        base: '/api/prospect',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team prospects',
      },
      person: {
        base: '/api/person',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports authorized persons',
      },
      player: {
        base: '/api/players',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team players',
      },
      playerAwards: {
        base: '/api/player-awards',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team playerAwards',
      },
      playerTeams: {
        base: '/api/player-teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team player-teams',
      },
      postSeason: {
        base: '/api/postseason-results',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team post season result',
      },
      combineScores: {
        base: '/api/combine-scores',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'Manage player combine scores and athletic metrics',
        specialEndpoints: [
          'GET /combine-scores/player/:playerId - Get scores by player',
          'POST /combine-scores/players/batch - Get scores for multiple players',
          'GET /combine-scores/top-performers - Get top performers by metric',
          'GET /combine-scores/athletic-score-range - Filter by athletic score',
          'GET /combine-scores/rankings/athletic - Overall athletic rankings',
          'PATCH /combine-scores/:id/metrics/:metric - Update specific metric',
        ],
      },
      draftPicks: {
        base: '/api/draft-picks',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team draftPicks',
      },
      schedule: {
        base: '/api/schedules',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team schedules',
      },
    },
    endpoints: [
      'GET /api/teams - Get all teams',
      'POST /api/teams - Create a team',
      'GET /api/teams/:id - Get team by ID',
      'PUT /api/teams/:id - Update team',
      'DELETE /api/teams/:id - Delete team',

      'GET /api/teamNeeds - Get all teamNeed',
      'POST /api/teamNeeds - Create a teamNeed',
      'GET /api/teamNeeds/:id - Get teamNeed by ID',
      'PUT /api/teamNeeds/:id - Update teamNeed',
      'DELETE /api/teamNeeds/:id - Delete teamNeed',

      'GET /api/players - Get all players',
      'POST /api/players - Create a player',
      'GET /api/players/:id - Get player by ID',
      'PUT /api/players/:id - Update player',
      'DELETE /api/players/:id - Delete player',

      'GET /api/player-awards - Get all playerAwards',
      'POST /api/player-awards - Create a playerAward',
      'GET /api/player-awards/:id - Get playerAward by ID',
      'PUT /api/player-awards/:id - Update playerAward',
      'DELETE /api/player-awards/:id - Delete playerAward',

      'GET /api/schedules - Get all schedules',
      'POST /api/schedules - Create a schedule',
      'GET /api/schedules/:id - Get schedule by ID',
      'PUT /api/schedules/:id - Update schedule',
      'DELETE /api/schedules/:id - Delete schedule',
    ],
    documentation: 'Coming soon...',
  });
});

export { router as apiRoutes };