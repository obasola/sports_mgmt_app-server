import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import playerRoutes from './modules/playerRoutes';
import teamRoutes from './modules/teamRoutes';
import pickRoutes from './modules/pickRoutes';
import combineScoreRoutes from './modules/combineScoreRoutes';
import playerAwardRoutes from './modules/playerAwardRoutes';
import playerTeamRoutes from './modules/playerTeamRoutes';
import postSeasonResultRoutes from './modules/postSeasonResultRoutes';
import scheduleRoutes from './modules/scheduleRoutes';
import personRoutes from './modules/personRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/picks', pickRoutes);
app.use('/api/combine-scores', combineScoreRoutes);
app.use('/api/player-awards', playerAwardRoutes);
app.use('/api/player-teams', playerTeamRoutes);
app.use('/api/post-season-results', postSeasonResultRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/persons', personRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong on the server',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Back Office Server (BOS) running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma client disconnected');
  process.exit(0);
});