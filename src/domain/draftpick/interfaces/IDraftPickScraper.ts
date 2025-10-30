 // src/server/domain/draftpick/interfaces/IDraftPickScraper.ts
import { DraftPickScraperResult } from '../dto/DraftPickDTO';

/**
 * Draft Pick Scraper Interface
 * Defines the contract for draft pick scraping operations
 * Follows Interface Segregation and Dependency Inversion principles
 */
export interface IDraftPickScraper {
  /**
   * Scrapes draft picks for a specific year
   * @param year The draft year to scrape
   * @returns Promise containing the scraped draft pick data
   */
  scrapeDraftYear(year: number): Promise<DraftPickScraperResult>;

  /**
   * Validates if a URL is scrapable
   * @param url The URL to validate
   * @returns Promise<boolean> indicating if the URL is valid
   */
  validateUrl(url: string): Promise<boolean>;
}