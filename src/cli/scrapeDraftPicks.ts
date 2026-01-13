#!/usr/bin/env node
// src/server/cli/scrapeDraftPicks.ts
import { prisma } from "@/infrastructure/database/prisma";
import { ProFootballReferenceScraper } from '../infrastructure/scraper/ProFootballReferenceScraper';
import { DraftPickImportService } from '../application/services/DraftPickImportService';
import { DraftPickScraperOrchestrator } from '../application/services/DraftPickScraperOrchestrator';
import { DEFAULT_SCRAPER_CONFIG } from '../infrastructure/scraper/IScraperConfig';

/**
 * Draft Pick Scraper CLI
 * Command-line interface for scraping NFL draft picks
 * 
 * Usage:
 *   npm run scrape:draft -- --year 2024
 *   npm run scrape:draft -- --years 2020,2021,2022,2023,2024
 *   npm run scrape:draft -- --validate 2024
 */



async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  try {
    // Parse command line arguments
    const command = parseArguments(args);

    // Initialize services
    const scraper = new ProFootballReferenceScraper(DEFAULT_SCRAPER_CONFIG);
    const importService = new DraftPickImportService(prisma);
    const orchestrator = new DraftPickScraperOrchestrator(scraper, importService);
    const yearValue = command.year ? command.year : 0;
    const yearValues = command.years ? command.years : [];
    // Execute command
    if (command.type === 'validate') {
      await handleValidate(orchestrator, yearValue);
    } else if (command.type === 'single') {
      await handleSingleYear(orchestrator, yearValue);
    } else if (command.type === 'multiple') {
      await handleMultipleYears(orchestrator, yearValues);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

function parseArguments(args: string[]): Command {
  const yearIndex = args.indexOf('--year');
  const yearsIndex = args.indexOf('--years');
  const validateIndex = args.indexOf('--validate');

  if (validateIndex !== -1 && args[validateIndex + 1]) {
    return {
      type: 'validate',
      year: parseInt(args[validateIndex + 1], 10),
    };
  }

  if (yearIndex !== -1 && args[yearIndex + 1]) {
    return {
      type: 'single',
      year: parseInt(args[yearIndex + 1], 10),
    };
  }

  if (yearsIndex !== -1 && args[yearsIndex + 1]) {
    const years = args[yearsIndex + 1].split(',').map((y) => parseInt(y.trim(), 10));
    return {
      type: 'multiple',
      years,
    };
  }

  throw new Error('Invalid arguments. Use --help for usage information.');
}

async function handleValidate(orchestrator: DraftPickScraperOrchestrator, year: number) {
  console.log(`\n🔍 Validating scraper for year ${year}...`);
  const isValid = await orchestrator.validateScraper(year);
  
  if (isValid) {
    console.log(`✅ Scraper URL is valid and accessible for year ${year}`);
  } else {
    console.log(`❌ Scraper URL is not accessible for year ${year}`);
    process.exit(1);
  }
}

async function handleSingleYear(orchestrator: DraftPickScraperOrchestrator, year: number) {
  console.log(`\n🚀 Starting draft pick scraper for year ${year}...`);
  console.log('─'.repeat(60));

  const result = await orchestrator.scrapeAndImport(year);

  printResult(result);
}

async function handleMultipleYears(orchestrator: DraftPickScraperOrchestrator, years: number[]) {
  console.log(`\n🚀 Starting draft pick scraper for ${years.length} years...`);
  console.log('─'.repeat(60));

  const results = await orchestrator.scrapeAndImportMultipleYears(years);

  results.forEach((result) => printResult(result));

  // Print summary
  console.log('\n📊 Summary');
  console.log('─'.repeat(60));
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(`Total years: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
}

function printResult(result: any) {
  console.log(`\n📅 Year: ${result.year}`);
  
  if (result.success) {
    console.log(`✅ Status: Success`);
    console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    
    if (result.scraperResult) {
      console.log(`\n📥 Scraping Results:`);
      console.log(`   Total picks scraped: ${result.scraperResult.totalPicks}`);
    }
    
    if (result.importResult) {
      console.log(`\n💾 Import Results:`);
      console.log(`   Total processed: ${result.importResult.totalProcessed}`);
      console.log(`   Players created: ${result.importResult.playersCreated}`);
      console.log(`   Players updated: ${result.importResult.playersUpdated}`);
      console.log(`   Draft picks created: ${result.importResult.draftPicksCreated}`);
      console.log(`   Draft picks updated: ${result.importResult.draftPicksUpdated}`);
      console.log(`   Player teams created: ${result.importResult.playerTeamsCreated}`);
      
      if (result.importResult.errors.length > 0) {
        console.log(`   ⚠️  Errors: ${result.importResult.errors.length}`);
        result.importResult.errors.forEach((err: any, idx: number) => {
          console.log(`      ${idx + 1}. ${err.pick.playerName}: ${err.error}`);
        });
      }
    }
  } else {
    console.log(`❌ Status: Failed`);
    console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`❗ Error: ${result.error}`);
  }
  
  console.log('─'.repeat(60));
}

function printHelp() {
  console.log(`
NFL Draft Pick Scraper CLI
──────────────────────────────────────────────────────────

USAGE:
  npm run scrape:draft -- [OPTIONS]

OPTIONS:
  --year <year>          Scrape draft picks for a single year
  --years <y1,y2,...>    Scrape draft picks for multiple years (comma-separated)
  --validate <year>      Validate if the scraper URL is accessible
  --help, -h             Show this help message

EXAMPLES:
  npm run scrape:draft -- --year 2024
  npm run scrape:draft -- --years 2020,2021,2022,2023,2024
  npm run scrape:draft -- --validate 2024

NOTES:
  - The scraper fetches data from pro-football-reference.com
  - Data is imported into the MySQL database (MyNFL schema)
  - Players, DraftPick, and PlayerTeam records are created/updated
  - A delay is added between multiple years to be respectful to the server
  `);
}

interface Command {
  type: 'single' | 'multiple' | 'validate';
  year?: number;
  years?: number[];
}

// Run the CLI
main();
