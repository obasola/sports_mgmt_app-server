import { CONFIG } from './env';

export interface ICronConfig {
  //enableCronJobs: boolean;
  scoreboardEnabled: boolean;
  scoreboardInterval: string;
}

export default class CronConfiguration implements ICronConfig {
  private static instance: CronConfiguration;
  
  private constructor() {}
  
  public static getInstance(): CronConfiguration {
    if (!CronConfiguration.instance) {
      CronConfiguration.instance = new CronConfiguration();
    }
    return CronConfiguration.instance;
  }
  
  public get scoreboardEnabled(): boolean {
    // Uses the same ENABLE_CRON_JOBS from .env
    return process.env.ENABLE_CRON_JOBS === 'true';
  }
  
  public get scoreboardInterval(): string {
    return process.env.SCOREBOARD_CRON_INTERVAL || '*/5 * * * *';
  }
}

export const cronConfig:CronConfiguration = CronConfiguration.getInstance();