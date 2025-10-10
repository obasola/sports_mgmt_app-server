// src/presentation/middleware/cors.ts
import cors from 'cors';

export function useCorsFromEnv() {
  const list = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return cors({
    origin: (origin, cb) => {
      // Allow same-origin/no-origin (curl, server-side) and explicit matches
      if (!origin || list.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  });
}
