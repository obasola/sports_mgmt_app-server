// src/presentation/routes/index.ts
import 'module-alias/register';

import { Router } from 'express';
import { teamRoutes } from './teamRoutes';
import { personRoutes } from './personRoutes';
import { playerRoutes } from './playerRoutes';
import { playerAwardRoutes } from './playerAwardRoutes';
import { combineScoreRoutes } from './combineScoreRoutes';
import { prospectRoutes } from './prospectRoutes';

import { scheduleRoutes } from './scheduleRoutes';
import { teamNeedRoutes } from './TeamNeedRoutes';
import { playerTeamRoutes } from './PlayerTeamRoutes';
import { postSeasonResultRoutes } from './PostSeasonResultRoutes';
import { gameRoutes } from './gameRoutes';

import { buildJobRoutes } from './jobRoutes';
import { JobController } from '../controllers/JobController'

// Import your job-related services from DI container
import { QueueJobService } from '../../application/jobs/services/QueueJobService';
import { RunJobService } from '../../application/jobs/services/RunJobService';
import { CancelJobService } from '../../application/jobs/services/CancelJobService';
import { ListJobsService } from '../../application/jobs/services/ListJobService';
import { GetJobDetailService } from '../../application/jobs/services/GetJobDetailService';
import GetJobLogsService from '../../application/jobs/services/GetJobLogService';
import { ScheduleJobService } from '../../application/jobs/services/ScheduleJobService';
//
import {
  queueJobService,
  runJobService,
  cancelJobService,
  listJobsService,
  getJobDetailService,
  getJobLogsService,
  scheduleJobService
} from '@/infrastructure/dependencies'

import { scoreboardJobs } from './jobs.scoreboard'
import { scoreboardScheduleRoutes } from './job.scoreboard.schedule';
import standingsRoutes from './standingsRoutes';
import { teamStandingsRoutes }  from './teamStandingsRoutes';
import { buildScoreboardRouter } from '../controllers/ScoreboardController';
import draftPickRoutes from './draftPickRoute'; // ADD THIS

const jobController = new JobController(
  queueJobService,
  runJobService,
  cancelJobService,
  listJobsService,
  getJobDetailService,
  getJobLogsService,
  scheduleJobService
)
const router = Router();

// Register all domain routes
router.use('/standings', standingsRoutes);
router.use('/combine-scores', combineScoreRoutes);
router.use('/draftpicks', draftPickRoutes); // ADD THIS LINE

router.use('/games', gameRoutes);
router.use('/persons', personRoutes);
router.use('/players', playerRoutes);
router.use('/player-awards', playerAwardRoutes);
router.use('/player-teams', playerTeamRoutes);
router.use('/prospects', prospectRoutes);
router.use('/postseason-results', postSeasonResultRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/standings', standingsRoutes);
router.use('/teamStandings', teamStandingsRoutes);
router.use('/teams', teamRoutes);
router.use('/team-needs', teamNeedRoutes);
router.use('/jobs', buildJobRoutes(jobController))
router.use('/jobs/kickoff/scoreboard', scoreboardJobs)
router.use('/jobs/scoreboard/schedule', scoreboardScheduleRoutes)
router.use('/scoreboard', buildScoreboardRouter()) // <— add this line

// Future routes (uncomment as you build them)
// 

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Management API v1 is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      combineScores: '/combine-scores',
      draftPicks: '/draft-picks',
      jobs: '/jobs',
      persons: '/persons',
      players: '/players',
      playerAwards: '/player-awards',
      playerTeams: '/player-teams',            
      postSeason: '/postseason-results',
      prospects: '/prospects',
      schedules: '/schedules',
      teams: '/teams',
      teamNeeds: '/teamNeeds',
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
        base: '/teamNeeds',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team needs',
      },
      games: {
        base: '/games',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team games',
      },
      teams: {
        base: '/teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports teams',
      },
      prospect: {
        base: '/prospect',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team prospects',
      },
      person: {
        base: '/person',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports authorized persons',
      },
      player: {
        base: '/players',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team players',
      },
      playerAwards: {
        base: '/player-awards',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team playerAwards',
      },
      playerTeams: {
        base: '/player-teams',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team player-teams',
      },
      postSeason: {
        base: '/postseason-results',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team post season result',
      },
      combineScores: {
        base: '/combine-scores',
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

      schedule: {
        base: '/schedules',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage sports team schedules',
      },
    },
    endpoints: [
      'GET /teams - Get all teams',
      'POST /teams - Create a team',
      'GET /teams/:id - Get team by ID',
      'PUT /teams/:id - Update team',
      'DELETE /teams/:id - Delete team',

      'GET /teamNeeds - Get all teamNeed',
      'POST /teamNeeds - Create a teamNeed',
      'GET /teamNeeds/:id - Get teamNeed by ID',
      'PUT /teamNeeds/:id - Update teamNeed',
      'DELETE /teamNeeds/:id - Delete teamNeed',

      'GET /players - Get all players',
      'POST /players - Create a player',
      'GET /players/:id - Get player by ID',
      'PUT /players/:id - Update player',
      'DELETE /players/:id - Delete player',

      'GET /player-awards - Get all playerAwards',
      'POST /player-awards - Create a playerAward',
      'GET /player-awards/:id - Get playerAward by ID',
      'PUT /player-awards/:id - Update playerAward',
      'DELETE /player-awards/:id - Delete playerAward',

      'GET /schedules - Get all schedules',
      'POST /schedules - Create a schedule',
      'GET /schedules/:id - Get schedule by ID',
      'PUT /schedules/:id - Update schedule',
      'DELETE /schedules/:id - Delete schedule',
    ],
    documentation: 'Coming soon...',
    
  });
});

export { router as apiRoutes };