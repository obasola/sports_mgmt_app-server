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
//app.use(`/api/${process.env.API_VERSION || ''}`, apiRoutes);
app.use(`/api`, apiRoutes);
 

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Add this debug logging
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log('📍 Route:', middleware.route.path);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        console.log('📍 Router Route:', handler.route.path);
      }
    });
  }
});

console.log('🔍 All routes registered. Testing endpoint...');
console.log('🧪 Test: curl http://localhost:5000/api/draftpicks/relations/team/1/year/2025');
export { app };