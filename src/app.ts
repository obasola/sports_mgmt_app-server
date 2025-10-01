// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRoutes } from './presentation/routes';
import { errorHandler } from './presentation/middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`/api/${process.env.API_VERSION || ''}`, apiRoutes);
 
// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export { app };