// src/index.ts (Main entry point)
//import './config/moduleAlias'; // If using module-alias
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import { apiRoutes } from './presentation/routes/index';
import { errorHandler } from './presentation/middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vue dev server
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// Also support /api without version for convenience
app.use('/api', apiRoutes);

// Catch-all route for 404s
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/v1/teams',
      'POST /api/v1/teams',
      'GET /api/v1/teams/:id',
      'PUT /api/v1/teams/:id',
      'DELETE /api/v1/teams/:id',
    ],
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`👥 Teams endpoint: http://localhost:${PORT}/api/v1/teams`);
});

export default app;