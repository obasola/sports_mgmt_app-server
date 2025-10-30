 // src/server/presentation/controllers/DraftPickScraperController.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProFootballReferenceScraper } from '../../infrastructure/scraper/ProFootballReferenceScraper';
import { DraftPickImportService } from '../../application/services/DraftPickImportService';
import { DraftPickScraperOrchestrator } from '../../application/services/DraftPickScraperOrchestrator';
import { DEFAULT_SCRAPER_CONFIG } from '../../infrastructure/scraper/IScraperConfig';

/**
 * Draft Pick Scraper Controller
 * Handles HTTP requests for draft pick scraping operations
 * Follows Single Responsibility Principle - only handles HTTP concerns
 */
export class DraftPickScraperController {
  private readonly orchestrator: DraftPickScraperOrchestrator;

  constructor(private readonly prisma: PrismaClient) {
    const scraper = new ProFootballReferenceScraper(DEFAULT_SCRAPER_CONFIG);
    const importService = new DraftPickImportService(prisma);
    this.orchestrator = new DraftPickScraperOrchestrator(scraper, importService);
  }

  /**
   * Scrapes and imports draft picks for a single year
   * POST /api/scraper/draft-picks/scrape
   */
  async scrapeDraftYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year } = req.body;

      if (!year || typeof year !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Year is required and must be a number',
        });
        return;
      }

      const result = await this.orchestrator.scrapeAndImport(year);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Scrapes and imports draft picks for multiple years
   * POST /api/scraper/draft-picks/scrape-multiple
   */
  async scrapeMultipleYears(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { years } = req.body;

      if (!Array.isArray(years) || years.some((y) => typeof y !== 'number')) {
        res.status(400).json({
          success: false,
          error: 'Years must be an array of numbers',
        });
        return;
      }

      const results = await this.orchestrator.scrapeAndImportMultipleYears(years);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validates if the scraper can access the URL for a given year
   * GET /api/scraper/draft-picks/validate/:year
   */
  async validateScraper(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.params.year, 10);

      if (isNaN(year)) {
        res.status(400).json({
          success: false,
          error: 'Invalid year parameter',
        });
        return;
      }

      const isValid = await this.orchestrator.validateScraper(year);

      res.status(200).json({
        success: true,
        data: {
          year,
          isValid,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
