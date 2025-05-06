// Install required dependencies first
// npm install swagger-jsdoc swagger-ui-express
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
// src/api/swagger.ts

import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports Management API',
      version: '1.0.0',
      description: 'API documentation for the Sports Management Application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@sports-mgmt-app.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/*/presentation/*.routes.ts', './src/api/swagger-components.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

// Define similar Swagger documentation for other routes:
// - /api/teams/{id}
// - /api/player-teams
// - /api/player-awards
// - /api/post-season-results
// - /api/schedules
// - /api/team-needs
