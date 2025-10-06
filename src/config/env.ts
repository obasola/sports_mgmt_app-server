// src/config/env.ts
import path from 'node:path';
import dotenvFlow from 'dotenv-flow';
import * as env from 'env-var';

// If NODE_ENV isn't set, default to 'development' so .env.development is used
process.env.NODE_ENV ??= 'development';

dotenvFlow.config({
  // Optional, but helps avoid odd CWDs when running CLIs from subfolders
  path: path.resolve(process.cwd()),
  default_node_env: 'development', // fallback if NODE_ENV is empty
  purge_dotenv: true,              // ignore any preloaded variables from a bare dotenv
});

/** CORS: prefer list, fall back to single origin */
function resolveCorsList(): string[] {
  const list = env.get('CORS_ALLOWED_ORIGINS').asString();
  if (list) return list.split(',').map(s => s.trim()).filter(Boolean);
  const single = env.get('CORS_ORIGIN').default('http://localhost:5173').asString();
  return [single];
}

/** Optional date: returns Date | undefined, with NaN guard */
function parseOptionalDate(varName: string): Date | undefined {
  const raw = env.get(varName).asString();           // empty string if missing
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export type AppEnv = 'development' | 'stage' | 'production';

export const CONFIG = {
  // Identity / modes
  appName:  env.get('APP_NAME').default('SportsMgmt API').asString(),
  appEnv:   env.get('APP_ENV').default('development').asEnum<AppEnv>(['development','stage','production']),
  nodeEnv:  env.get('NODE_ENV').default('development').asString(),

  // Network
  port:         env.get('PORT').default('4000').asPortNumber(),
  corsAllowed:  resolveCorsList(),
  clientUrl:    env.get('CLIENT_URL').default('http://localhost:5173').asString(),

  // Versioning
  apiVersion:   env.get('apiVersion').default('v1.0').asString(),
  version:      env.get('VERSION').default('b0.1').asString(),

  // Database / Prisma
  dbUrl:               env.get('DATABASE_URL').required().asString(),
  prismaClientOutput:  env.get('PRISMA_CLIENT_OUTPUT').asString(), // used by Prisma generator, not runtime

  // Logging
  logLevel:      env.get('LOG_LEVEL').default('info').asString(),

  // Feature flags / Ops
  enableCronJobs: env.get('ENABLE_CRON_JOBS').default('false').asBool(),
  sseLogs:        env.get('ENABLE_SSE_LOGS').default('false').asBool(),

  // Domain
  nflSeason:  env.get('NFL_SEASON').default('2025').asIntPositive(),
  teamKey:    env.get('TEAM').default('kc').asString().toLowerCase(),

  // ESPN fixtures / offline controls
  espnOffline:  env.get('ESPN_OFFLINE').default('0').asBool(),   // accepts "0"/"1"/"true"/"false"
  espnFallback: env.get('ESPN_FALLBACK').default('1').asBool(),
  fixtureDate:  parseOptionalDate('FIXTURE_DATE'),               // Date | undefined

  // Scheduling
  scoreboardCron: env.get('SCOREBOARD_CRON_INTERVAL').default('*/5 * * * *').asString(),
} as const;

export const isDev  = CONFIG.nodeEnv === 'development';
export const isProd = CONFIG.nodeEnv === 'production';
