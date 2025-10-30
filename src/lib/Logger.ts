// src/lib/Logger.ts
// Simple logger implementation if you don't already have one

export class Logger {
  constructor(private readonly context: string) {}

  info(message: string, meta?: Record<string, any>): void {
    console.log(`[${this.context}] INFO:`, message, meta ? JSON.stringify(meta) : '');
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`[${this.context}] ERROR:`, message, meta ? JSON.stringify(meta) : '');
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[${this.context}] WARN:`, message, meta ? JSON.stringify(meta) : '');
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.context}] DEBUG:`, message, meta ? JSON.stringify(meta) : '');
    }
  }
}