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

const router = Router();

// Register all domain routes
router.use('/teams', teamRoutes);
router.use('/person', personRoutes);
router.use('/players', playerRoutes);
router.use('/player-awards', playerAwardRoutes);
router.use('/combine-scores', combineScoreRoutes);
router.use('/prospects', prospectRoutes);
router.use('/draft-picks', draftpickRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/team-needs', teamNeedRoutes);
router.use('/player-teams', playerTeamRoutes);
router.use('/postseason-results', postSeasonResultRoutes);
router.use('/persons', personRoutes);

// Future routes (uncomment as you build them)
// 

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Management API v1 is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      teams: '/api/v1/teams',
      teamNeeds: '/api/v1/teamNeeds',
      prospects: '/api/v1/prospects',
      persons: '/api/v1/persons',
      players: '/api/v1/players',
      playerAwards: '/api/v1/player-awards',
      playerTeams: '/api/v1/player-teams',
      combineScores: '/api/v1/combine-scores',
      draftPicks: '/api/v1/draft-picks',
      schedules: '/api/v1/schedules',
      postSeason: '/api/v1/postseason-results',
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
        base: '/api/v1/teamNeeds',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team needs',
      },
      teams: {
        base: '/api/v1/teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports teams',
      },
      prospect: {
        base: '/api/v1/prospect',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team prospects',
      },
      person: {
        base: '/api/v1/person',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports authorized persons',
      },
      player: {
        base: '/api/v1/players',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team players',
      },
      playerAwards: {
        base: '/api/v1/player-awards',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team playerAwards',
      },
      playerTeams: {
        base: '/api/v1/player-teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team player-teams',
      },
      postSeason: {
        base: '/api/v1/postseason-results',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team post season result',
      },
      combineScores: {
        base: '/api/v1/combine-scores',
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
        base: '/api/v1/draft-picks',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team draftPicks',
      },
      schedule: {
        base: '/api/v1/schedules',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team schedules',
      },
    },
    endpoints: [
      'GET /api/v1/teams - Get all teams',
      'POST /api/v1/teams - Create a team',
      'GET /api/v1/teams/:id - Get team by ID',
      'PUT /api/v1/teams/:id - Update team',
      'DELETE /api/v1/teams/:id - Delete team',

      'GET /api/v1/teamNeeds - Get all teamNeed',
      'POST /api/v1/teamNeeds - Create a teamNeed',
      'GET /api/v1/teamNeeds/:id - Get teamNeed by ID',
      'PUT /api/v1/teamNeeds/:id - Update teamNeed',
      'DELETE /api/v1/teamNeeds/:id - Delete teamNeed',

      'GET /api/v1/players - Get all players',
      'POST /api/v1/players - Create a player',
      'GET /api/v1/players/:id - Get player by ID',
      'PUT /api/v1/players/:id - Update player',
      'DELETE /api/v1/players/:id - Delete player',

      'GET /api/v1/player-awards - Get all playerAwards',
      'POST /api/v1/player-awards - Create a playerAward',
      'GET /api/v1/player-awards/:id - Get playerAward by ID',
      'PUT /api/v1/player-awards/:id - Update playerAward',
      'DELETE /api/v1/player-awards/:id - Delete playerAward',

      'GET /api/v1/schedules - Get all schedules',
      'POST /api/v1/schedules - Create a schedule',
      'GET /api/v1/schedules/:id - Get schedule by ID',
      'PUT /api/v1/schedules/:id - Update schedule',
      'DELETE /api/v1/schedules/:id - Delete schedule',
    ],
    documentation: 'Coming soon...',
  });
});

export { router as apiRoutes };