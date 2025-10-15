import 'module-alias/register'; // ✅ must be first for @/... paths to resolve
import './config/env';          // ✅ loads dotenv-flow next
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import os from 'node:os';

import { CONFIG, isDev } from './config/env';
import { apiRoutes } from './presentation/routes';
import { errorHandler } from './presentation/middleware/errorHandler';
import { initScoreboardCron } from './jobs/scoreboardCron';
import { buildJobsModule } from './bootstrap/jobsModule';
import { useCorsFromEnv } from './presentation/middleware/cors';


const app = express();

// ---- core config
const PORT = CONFIG.port;
//const API_BASE = `/api/${CONFIG.apiVersion}`; // e.g., /api/v1.0
const API_BASE = `/api`; // e.g., /api

// ---- middleware
app.use(helmet());
app.use(useCorsFromEnv());
// quieter logs in test; verbose in dev/prod
app.use(
  morgan(isDev ? 'dev' : 'combined', {
    skip: () => process.env.NODE_ENV === 'test',
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- health
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    app: CONFIG.appName,
    env: CONFIG.appEnv,
    nodeEnv: CONFIG.nodeEnv,
    version: CONFIG.version,
    apiVersion: CONFIG.apiVersion,
    time: new Date().toISOString(),
    pid: process.pid,
    host: os.hostname(),
  });
});

// ---- routes
app.use(API_BASE, apiRoutes);
// optional non-versioned convenience (keep if you want to support both)
app.use('/api', apiRoutes);

// Jobs module
const { routes: jobsRoutes } = buildJobsModule();
app.use(`${API_BASE}/jobs`, jobsRoutes);
// optional alias:
app.use('/api/jobs', jobsRoutes);

// ---- list all registered routes (debugging only)
console.log('Registered routes:')
;(app._router?.stack || [])
  .filter((r: any) => r.route)
  .forEach((r: any) => {
    const methods = Object.keys(r.route.methods)
      .map(m => m.toUpperCase())
      .join(',');
    console.log(`${methods.padEnd(10)} ${r.route.path}`);
  });

  
// ---- 404
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: `Route ${req.originalUrl} not found`,
    hint: `Try ${API_BASE}/* endpoints or /health`,
  });
});

// ---- errors (keep last)
app.use(errorHandler);

// ---- start
const server = app.listen(PORT, () => {
  console.log(`🚀 ${CONFIG.appName} v${CONFIG.version} up on :${PORT}`);
  console.log(`📱 APP_ENV=${CONFIG.appEnv} NODE_ENV=${CONFIG.nodeEnv}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📋 API Base: http://localhost:${PORT}${API_BASE}`);
  console.log(`🌐 CORS Allowed: ${CONFIG.corsAllowed.join(', ')}`);
});

// ---- graceful shutdown
function shutdown(sig: string) {
  console.log(`\n${sig} received. Shutting down...`);
  server.close(err => {
    if (err) {
      console.error('Error closing server', err);
      process.exit(1);
    }
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ---- cron (gated)
(async () => {
  if (!CONFIG.enableCronJobs) {
    console.log('⏸️  Cron jobs disabled (ENABLE_CRON_JOBS=false)');
    return;
  }
  try {
    await initScoreboardCron();
    console.log(`🕒 Cron scheduled: ${CONFIG.scoreboardCron}`);
  } catch (err) {
    console.error('cron init failed', err);
  }
})();

export default app;
