// src/infrastructure/scraper/IScraperConfig.ts
/**
 * Scraper Configuration Interface
 * Defines the contract for scraper configuration
 */
export interface IScraperConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  userAgent: string;
}

export const DEFAULT_SCRAPER_CONFIG: IScraperConfig = {
  baseUrl: 'https://www.pro-football-reference.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};