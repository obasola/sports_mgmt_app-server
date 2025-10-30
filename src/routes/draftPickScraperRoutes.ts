 // src/server/routes/draftPickScraperRoutes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DraftPickScraperController } from '../presentation/controllers/DraftPickScraperController';

/**
 * Draft Pick Scraper Routes
 * Defines HTTP routes for draft pick scraping operations
 */
export function createDraftPickScraperRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new DraftPickScraperController(prisma);

  /**
   * POST /api/scraper/draft-picks/scrape
   * Scrapes and imports draft picks for a single year
   * Body: { year: number }
   */
  router.post('/scrape', (req, res, next) => controller.scrapeDraftYear(req, res, next));

  /**
   * POST /api/scraper/draft-picks/scrape-multiple
   * Scrapes and imports draft picks for multiple years
   * Body: { years: number[] }
   */
  router.post('/scrape-multiple', (req, res, next) => controller.scrapeMultipleYears(req, res, next));

  /**
   * GET /api/scraper/draft-picks/validate/:year
   * Validates if the scraper can access the URL for a given year
   */
  router.get('/validate/:year', (req, res, next) => controller.validateScraper(req, res, next));

  return router;
}
