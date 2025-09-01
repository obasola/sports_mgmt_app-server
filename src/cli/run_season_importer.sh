# NFL_SEASON=2025 npm run import:nfl

# Ensure DATABASE_URL is set for Prisma
# export DATABASE_URL="mysql://user:pass@host:3306/MyNFL"

# Recommended: use tsx (fast), but ts-node works too
npx tsx src/cli/import-nfl-season.ts --year 2025 --seasons pre reg
# or
# npx ts-node -r tsconfig-paths/register src/cli/import-nfl-season.ts --year 2025 --seasons pre reg