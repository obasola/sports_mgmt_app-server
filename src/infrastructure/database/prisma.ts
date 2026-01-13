// src/infrastructure/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.trim().length === 0) {
  throw new Error("DATABASE_URL is missing");
}

// Prisma 7 + MySQL: requires adapter or accelerateUrl
const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});
