// src/infrastructure/logging/DebugLogger.ts

export class DebugLogger {
  private static instance: DebugLogger;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = process.env.ENABLE_DEBUG === 'true';
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  public log(message: string, ...args: any[]): void {
    if (this.isEnabled) {
      console.log(message, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.isEnabled) {
      console.warn(message, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    // Errors should always be logged regardless of debug mode
    console.error(message, ...args);
  }

  public isDebugEnabled(): boolean {
    return this.isEnabled;
  }
}