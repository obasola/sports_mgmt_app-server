 // src/server/application/services/DraftPickScraperOrchestrator.ts
import { IDraftPickScraper } from '../../domain/draftpick/interfaces/IDraftPickScraper';
import { DraftPickImportService, ImportResult } from './DraftPickImportService';

/**
 * Draft Pick Scraper Orchestrator
 * Coordinates the scraping and importing process
 * Follows Single Responsibility Principle and Open/Closed Principle
 */
export class DraftPickScraperOrchestrator {
  constructor(
    private readonly scraper: IDraftPickScraper,
    private readonly importService: DraftPickImportService
  ) {}

  /**
   * Scrapes and imports draft picks for a specific year
   */
  async scrapeAndImport(year: number): Promise<OrchestratorResult> {
    const startTime = Date.now();

    try {
      // Step 1: Scrape data
      const scraperResult = await this.scraper.scrapeDraftYear(year);

      // Step 2: Import data
      const importResult = await this.importService.importDraftPicks(year, scraperResult.picks);

      const duration = Date.now() - startTime;

      return {
        success: true,
        year,
        scraperResult,
        importResult,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        year,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Scrapes and imports draft picks for multiple years
   */
  async scrapeAndImportMultipleYears(years: number[]): Promise<OrchestratorResult[]> {
    const results: OrchestratorResult[] = [];

    for (const year of years) {
      const result = await this.scrapeAndImport(year);
      results.push(result);

      // Add delay between years to be respectful to the server
      if (years.indexOf(year) < years.length - 1) {
        await this.delay(2000);
      }
    }

    return results;
  }

  /**
   * Validates the scraper URL before processing
   */
  async validateScraper(year: number): Promise<boolean> {
    const url = `https://www.pro-football-reference.com/years/${year}/draft.htm`;
    return this.scraper.validateUrl(url);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Orchestrator Result Interface
 */
export interface OrchestratorResult {
  success: boolean;
  year: number;
  scraperResult?: {
    year: number;
    picks: any[];
    totalPicks: number;
    scrapedAt: Date;
  };
  importResult?: ImportResult;
  error?: string;
  duration: number;
}
