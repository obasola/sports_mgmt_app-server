import { createServer } from 'http';
import config from './config/config';
import { PrismaService } from './shared/infrastructure/persistence/prisma.service';
import 'module-alias/register';
import app from './app';

// Initialize database connection
const prisma = PrismaService.getInstance();

async function startServer() {
  try {
    // Connect to database
    await prisma.connect();

    // Create HTTP server
    const server = createServer(app);

    // Start listening
    server.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
      console.log(`API available at http://localhost:${config.port}${config.apiPrefix}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await prisma.disconnect();
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
