import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import routes from './api/routes';
import { setupSwagger } from './api/swagger';

// Create Express application
const app: Express = express();
// Set up Swagger documentation
setupSwagger(app);
// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(morgan(config.env === 'development' ? 'dev' : 'combined')); // Request logging

// API routes
console.log('Registering API routes');
app.use('/api', routes);
console.log('API routes registered');
//app.use(config.apiPrefix === null ? 'api' : config.apiPrefix, routes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error('Error:', err);

  res.status(500).json({
    message: 'Internal server error',
    error: config.env === 'development' ? err.message : undefined,
  });
});

export default app;
